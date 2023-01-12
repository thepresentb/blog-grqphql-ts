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
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
const User_1 = require("../entity/User");
const type_graphql_1 = require("type-graphql");
const RegisterInput_1 = require("../type/RegisterInput");
const UserMutationResponse_1 = require("../type/UserMutationResponse");
const LoginInput_1 = require("../type/LoginInput");
const token_1 = require("../util/token");
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const typeorm_1 = require("typeorm");
let UserResolver = class UserResolver {
    async getUser({ user }) {
        try {
            const existingUser = await User_1.User.findOne({ where: { id: user === null || user === void 0 ? void 0 : user.userId } });
            if (existingUser) {
                return existingUser;
            }
            else {
                return Promise.reject();
            }
        }
        catch (err) {
            return Promise.reject();
        }
    }
    async getUserByUsername(username) {
        try {
            if (username === "") {
                return [];
            }
            const findOption = `%${username}%`;
            const listUsers = await User_1.User.find({
                where: {
                    username: (0, typeorm_1.Like)(findOption),
                },
            });
            return listUsers;
        }
        catch (err) {
            return Promise.reject();
        }
    }
    async register({ res }, { username, email, password }) {
        try {
            if (username.length < 6) {
                return {
                    status: 400,
                    message: "Username must be at least 6 characters long!!!",
                };
            }
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return {
                    status: 400,
                    message: "You have entered an invalid email address!!!",
                };
            }
            const existingUser = await User_1.User.findOne({ where: [{ username }, { email }] });
            if (existingUser) {
                return {
                    status: 400,
                    message: `${existingUser.username === username ? "username" : "email"} already exists!!!`,
                };
            }
            const hashedPassword = await argon2_1.default.hash(password);
            const newUser = User_1.User.create({
                username,
                email,
                password: hashedPassword,
            });
            const user = await newUser.save();
            (0, token_1.saveRefreshTokenToCookie)(res, user);
            return {
                status: 200,
                message: `registered successfully!!!`,
                user: user,
                accessToken: (0, token_1.createAccessToken)(user),
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: 500,
                message: "internal server error!!!",
            };
        }
    }
    async login({ res }, { username, password }) {
        try {
            const existingUser = await User_1.User.findOne({ where: { username: username } });
            if (!existingUser) {
                return {
                    status: 400,
                    message: "username or password incorrect",
                };
            }
            const passwordValid = await argon2_1.default.verify(existingUser.password, password);
            if (!passwordValid) {
                return {
                    status: 400,
                    message: "username or password incorrect",
                };
            }
            (0, token_1.saveRefreshTokenToCookie)(res, existingUser);
            return {
                status: 200,
                message: "login successful",
                user: existingUser,
                accessToken: (0, token_1.createAccessToken)(existingUser),
            };
        }
        catch (error) {
            return {
                status: 500,
                message: "internal server error",
            };
        }
    }
    async logout({ res }) {
        res.clearCookie(process.env.REFRESH_TOKEN_NAME, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/refresh_token",
        });
        return { status: 200, message: "logout successfully" };
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User),
    (0, type_graphql_1.UseMiddleware)(checkAuth_1.default),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __param(0, (0, type_graphql_1.Arg)("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUserByUsername", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("registerInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RegisterInput_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("loginInput")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, LoginInput_1.LoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map