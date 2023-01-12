"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const checkAuth = ({ context }, next) => {
    try {
        const authHeader = context.req.header("authorization");
        const accessToken = authHeader && authHeader.split(" ")[1];
        if (!accessToken) {
            throw new Error("not authenticated");
        }
        const decodedUser = (0, jsonwebtoken_1.verify)(accessToken, process.env.ACCESS_TOKEN_KEY);
        context.user = decodedUser;
        return next();
    }
    catch (err) {
        throw new Error(err);
    }
};
exports.default = checkAuth;
//# sourceMappingURL=checkAuth.js.map