import { Context } from "./../type/Context";
import { CreatePostInput } from "../type/CreatePostInput";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { PostMutationResponse } from "../type/PostMutationResponse";
import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { PaginatedPosts } from "../type/paginatedPosts";
import { LessThan } from "typeorm";
import { TotalTags } from "../type/TotalTags";
import { FilterType } from "../type/FilterType";
import checkAuth from "../middleware/checkAuth";
import { UpdatePostInput } from "../type/UpdatePostInput";

@Resolver(() => Post)
export class PostResolver {
  @FieldResolver(() => User)
  async user(@Root() rootPost: Post): Promise<User | null> {
    return await User.findOne({ where: { id: rootPost.userId } });
  }

  @FieldResolver(() => String)
  textShort(@Root() rootPost: Post): string {
    if (rootPost.text.length <= 100) {
      return rootPost.text;
    }
    return rootPost.text.slice(0, 100) + "...";
  }

  @Mutation(() => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Ctx() { user }: Context,
    @Arg("createPostInput") { title, text, tag }: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title: title,
        text: text,
        userId: user?.userId,
        tag: tag,
      });

      const post = await newPost.save();

      return {
        status: 200,
        message: "Post Created Successfully",
        post: post,
      };
    } catch (error) {
      return {
        status: 500,
        message: "internal server error!!!",
      };
    }
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("filter", { nullable: true }) filter: FilterType,
    @Arg("limit") limit: number,
    @Arg("cursor", { nullable: true }) cursor: Date
  ): Promise<PaginatedPosts> {
    try {
      if (filter) {
        const totalCount = await Post.count({ where: filter });
        const maxLimit = Math.min(limit, 10);

        const findOptions: { [key: string]: any } = {
          where: filter,
          order: {
            createdAt: "DESC",
          },
          take: maxLimit,
        };

        let lastPost: Post[] = [];
        if (cursor) {
          findOptions.where["createdAt"] = LessThan(cursor);
          lastPost = await Post.find({
            where: filter,
            order: { createdAt: "ASC" },
            take: 1,
          });
        }

        const paginatedPosts = await Post.find(findOptions);

        return {
          totalCount: totalCount,
          cursor: paginatedPosts.length !== 0 ? paginatedPosts[paginatedPosts.length - 1].createdAt : new Date(),
          hasMore:
            cursor && paginatedPosts.length !== 0
              ? paginatedPosts[paginatedPosts.length - 1].createdAt.toString() !== lastPost[0].createdAt.toString()
              : paginatedPosts.length !== totalCount,
          paginatedPosts: paginatedPosts,
        };
      }

      const totalCount = await Post.count();
      const maxLimit = Math.min(limit, 10);

      const findOptions: { [key: string]: any } = {
        order: {
          createdAt: "DESC",
        },
        take: maxLimit,
      };

      let lastPost: Post[] = [];
      if (cursor) {
        findOptions.where = {
          createdAt: LessThan(cursor),
        };
        lastPost = await Post.find({
          order: { createdAt: "ASC" },
          take: 1,
        });
      }

      const paginatedPosts = await Post.find(findOptions);

      return {
        totalCount: totalCount,
        cursor: paginatedPosts[paginatedPosts.length - 1].createdAt,
        hasMore: cursor
          ? paginatedPosts[paginatedPosts.length - 1].createdAt.toString() !== lastPost[0].createdAt.toString()
          : paginatedPosts.length !== totalCount,
        paginatedPosts: paginatedPosts,
      };

      // return await Post.find();
    } catch (error) {
      return Promise.reject();
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { id, title, text, tag }: UpdatePostInput,
    @Ctx() { user }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id: id } });
      if (!existingPost)
        return {
          status: 400,
          message: "Post not found",
        };

      if (existingPost.userId !== user?.userId) {
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
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "server internal error",
      };
    }
  }

  @Mutation(() => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(@Arg("id") id: number, @Ctx() { user }: Context): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id: id } });
      if (!existingPost)
        return {
          status: 400,
          message: "Post not found",
        };

      if (existingPost.userId !== user?.userId) {
        return { status: 401, message: "Unauthorized" };
      }

      existingPost.softRemove();

      return { status: 200, message: "Post deleted successfully" };
    } catch (error) {
      return {
        status: 500,
        message: "server internal error",
      };
    }
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id") id: number): Promise<Post | null> {
    try {
      const post = await Post.findOne({ where: { id: id } });
      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Query(() => TotalTags)
  async getTotalTags(@Arg("userId", { nullable: true }) userId: number): Promise<TotalTags> {
    try {
      let listPosts: Post[] = [];
      if (userId) {
        listPosts = await Post.find({ where: { userId: userId } });
      } else {
        listPosts = await Post.find();
      }

      let listTags: { [key: string]: number } = {};
      listPosts.forEach((post) => {
        if (!listTags[post.tag]) {
          listTags[post.tag] = 1;
        } else {
          listTags[post.tag] += 1;
        }
      });

      let listKeys: string[] = [];
      let listValues: number[] = [];
      Object.keys(listTags).forEach((key) => {
        listKeys.push(key);
        listValues.push(listTags[key]);
      });

      return {
        listKeys: listKeys,
        listValues: listValues,
      };
    } catch (error) {
      return Promise.reject();
    }
  }
}
