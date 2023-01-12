"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const createAccessToken = (user) => {
    const accessToken = (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
        expiresIn: "20m",
    });
    return accessToken;
};
exports.createAccessToken = createAccessToken;
//# sourceMappingURL=auth.js.map