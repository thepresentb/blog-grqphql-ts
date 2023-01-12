"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRefreshTokenToCookie = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const createAccessToken = (user) => {
    const accessToken = (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: "60s",
    });
    return accessToken;
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => {
    const accessToken = (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: "1h",
    });
    return accessToken;
};
const saveRefreshTokenToCookie = (res, user) => {
    res.cookie(process.env.REFRESH_TOKEN_NAME, createRefreshToken(user), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/refresh_token",
    });
};
exports.saveRefreshTokenToCookie = saveRefreshTokenToCookie;
//# sourceMappingURL=token.js.map