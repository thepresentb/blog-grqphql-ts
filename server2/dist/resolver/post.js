"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const CreatePostInput_1 = require("../type/CreatePostInput");
const type_graphql_1 = require("type-graphql");
const PostMutationResponse_1 = require("../type/PostMutationResponse");
const Post_1 = require("../entity/Post");
const User_1 = require("../entity/User");
const paginatedPosts_1 = require("../type/paginatedPosts");
const typeorm_1 = require("typeorm");
const TotalTags_1 = require("../type/TotalTags");
const FilterType_1 = require("../type/FilterType");
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const UpdatePostInput_1 = require("../type/UpdatePostInput");
let PostResolver = class PostResolver {
    async user(rootPost) {
        return await User_1.User.findOne({ where: { id: rootPost.userId } });
    }
    textShort(rootPost) {
        if (rootPost.text.length <= 100) {
            return rootPost.text;
        }
        return rootPost.text.slice(0, 100) + "...";
    }
    async createPost({ user }, { title, text, tag }) {
        try {
            const newPost = Post_1.Post.create({
                title: title,
                text: text,
                userId: user === null || user === void 0 ? void 0 : user.userId,
                tag: tag,
            });
            const post = await newPost.save();
            return {
                status: 200,
                message: "Post Created Successfully",
                post: post,
            };
        }
        catch (error) {
            return {
                status: 500,
                message: "internal server error!!!",
            };
        }
    }
    async posts(filter, limit, cursor) {
        try {
            if (filter) {
                const totalCount = await Post_1.Post.count({ where: filter });
                const maxLimit = Math.min(limit, 10);
                const findOptions = {
                    where: filter,
                    order: {
                        createdAt: "DESC",
                    },
                    take: maxLimit,
                };
                let lastPost = [];
                if (cursor) {
                    findOptions.where["createdAt"] = (0, typeorm_1.LessThan)(cursor);
                    lastPost = await Post_1.Post.find({
                        where: filter,
                        order: { createdAt: "ASC" },
                        take: 1,
                    });
                }
                const paginatedPosts = await Post_1.Post.find(findOptions);
                return {
                    totalCount: totalCount,
                    cursor: paginatedPosts.length !== 0 ? paginatedPosts[paginatedPosts.length - 1].createdAt : new Date(),
                    hasMore: cursor && paginatedPosts.length !== 0
                        ? paginatedPosts[paginatedPosts.length - 1].createdAt.toString() !== lastPost[0].createdAt.toString()
                        : paginatedPosts.length !== totalCount,
                    paginatedPosts: paginatedPosts,
                };
            }
            const totalCount = await Post_1.Post.count();
            const maxLimit = Math.min(limit, 10);
            const findOptions = {
                order: {
                    createdAt: "DESC",
                },
                take: maxLimit,
            };
            let lastPost = [];
            if (cursor) {
                findOptions.where = {
                    createdAt: (0, typeorm_1.LessThan)(cursor),
                };
                lastPost = await Post_1.Post.find({
                    order: { createdAt: "ASC" },
                    take: 1,
                });
            }
            const paginatedPosts = await Post_1.Post.find(findOptions);
            return {
                totalCount: totalCount,
                cursor: paginatedPosts[paginatedPosts.length - 1].createdAt,
                hasMore: cursor
                    ? paginatedPosts[paginatedPosts.length - 1].createdAt.toString() !== lastPost[0].createdAt.toString()
                    : paginatedPosts.length !== totalCount,
                paginatedPosts: paginatedPosts,
            };
        }
        catch (error) {
            return Promise.reject();
        }
    }
    async updatePost({ id, title, text, tag }, { user }) {
        try {
            const existingPost = await Post_1.Post.findOne({ where: { id: id } });
            if (!existingPost)
                return {
                    status: 400,
                    message: "Post not found",
                };
            if (existingPost.userId !== (user === null || user === void 0 ? void 0 : user.userId)) {
                return { status: 401, message: "unauthorized" };
            }
            existingPost.title = title;
            existingPost.text = text;
            existingPost.tag = tag;
            await existingPost.save();
            return {
                status: 200,
                message: "Post updated successfully",
                post: existingPost,
            };
        }
        catch (err) {
            console.log(err);
            return {
                status: 500,
                message: "server internal error",
            };
        }
    }
    async deletePost(id, { user }) {
        try {
            const existingPost = await Post_1.Post.findOne({ where: { id: id } });
            if (!existingPost)
                return {
                    status: 400,
                    message: "Post not found",
                };
            if (existingPost.userId !== (user === null || user === void 0 ? void 0 : user.userId)) {
                return { status: 401, message: "Unauthorized" };
            }
            existingPost.softRemove();
            return { status: 200, message: "Post deleted successfully" };
        }
        catch (error) {
            return {
                status: 500,
                message: "server internal error",
            };
        }
    }
    async post(id) {
        try {
            const post = await Post_1.Post.findOne({ where: { id: id } });
            return post;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async getTotalTags(userId) {
        try {
            let listPosts = [];
            if (userId) {
                listPosts = await Post_1.Post.find({ where: { userId: userId } });
            }
            else {
                listPosts = await Post_1.Post.find();
            }
            let listTags = {};
            listPosts.forEach((post) => {
                if (!listTags[post.tag]) {
                    listTags[post.tag] = 1;
                }
                else {
                    listTags[post.tag] += 1;
                }
            });
            let listKeys = [];
            let listValues = [];
            Object.keys(listTags).forEach((key) => {
                listKeys.push(key);
                listValues.push(listTags[key]);
            });
            return {
                listKeys: listKeys,
                listValues: listValues,
            };
        }
        catch (error) {
            return Promise.reject();
        }
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", String)
], PostResolver.prototype, "textShort", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.default),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("createPostInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreatePostInput_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Query)(() => paginatedPosts_1.PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("filter", { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("limit")),
    __param(2, (0, type_graphql_1.Arg)("cursor", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FilterType_1.FilterType, Number, Date]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Mutation)((_return) => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.default),
    __param(0, (0, type_graphql_1.Arg)("updatePostInput")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdatePostInput_1.UpdatePostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PostMutationResponse_1.PostMutationResponse),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.default),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Query)(() => TotalTags_1.TotalTags),
    __param(0, (0, type_graphql_1.Arg)("userId", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getTotalTags", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map