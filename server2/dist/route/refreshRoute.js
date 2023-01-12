"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const express_1 = __importDefault(require("express"));
const User_1 = require("../entity/User");
const token_1 = require("../util/token");
const route = express_1.default.Router();
route.get("/", async (req, res) => {
    try {
        const refreshToken = req.cookies[process.env.REFRESH_TOKEN_NAME];
        if (!refreshToken) {
            res.status(401);
        }
        const decodedUser = (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_TOKEN_KEY);
        const existingUser = await User_1.User.findOne({ where: { id: decodedUser.userId } });
        if (!existingUser) {
            res.status(401);
        }
        (0, token_1.saveRefreshTokenToCookie)(res, existingUser);
        return res.json({
            statusbar: "success",
            accessToken: (0, token_1.createAccessToken)(existingUser),
        });
    }
    catch (err) {
        return res.sendStatus(403);
    }
});
exports.default = route;
//# sourceMappingURL=refreshRoute.js.map