"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const user_1 = require("./resolver/user");
require("dotenv").config();
const data_source_1 = require("./data-source");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const plugin_1 = require("apollo-server-core/dist/plugin");
const greeting_1 = require("./resolver/greeting");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const refreshRoute_1 = __importDefault(require("./route/refreshRoute"));
const post_1 = require("./resolver/post");
async function startApolloServer() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.use("/refresh_token", refreshRoute_1.default);
    const httpServer = (0, http_1.createServer)(app);
    const server = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [greeting_1.GreetingResolver, user_1.UserResolver, post_1.PostResolver],
            validate: false,
        }),
        context: ({ req, res }) => {
            return { req, res };
        },
        plugins: [(0, plugin_1.ApolloServerPluginDrainHttpServer)({ httpServer }), plugin_1.ApolloServerPluginLandingPageGraphQLPlayground],
    });
    await server.start();
    server.applyMiddleware({
        app,
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        data_source_1.AppDataSource.initialize()
            .then(() => {
            console.log("Data Source has been initialized!");
        })
            .catch((err) => {
            console.error("Error during Data Source initialization", err);
        });
        console.log(`Server is listening on port ${PORT}${server.graphqlPath}`);
    });
}
startApolloServer();
//# sourceMappingURL=index.js.map