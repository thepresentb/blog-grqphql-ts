import "reflect-metadata";
import { UserResolver } from "./resolver/user";
require("dotenv").config();
import { AppDataSource } from "./data-source";
import express from "express";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core/dist/plugin";
import { GreetingResolver } from "./resolver/greeting";
import { Context } from "./type/Context";
import cors from "cors";
import cookieParser from "cookie-parser";
import refreshRoute from "./route/refreshRoute";
import { PostResolver } from "./resolver/post";

async function startApolloServer() {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true, //access-control-allow-credentials:true
    })
  );

  app.use(cookieParser());

  app.use("/refresh_token", refreshRoute);

  // create server apollo
  const httpServer = createServer(app);
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [GreetingResolver, UserResolver, PostResolver],
      validate: false,
    }),

    context: ({ req, res }): Context => {
      return { req, res };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), ApolloServerPluginLandingPageGraphQLPlayground],
  });

  await server.start();
  server.applyMiddleware({
    app,
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // start app and initialize db gp
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    AppDataSource.initialize()
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
