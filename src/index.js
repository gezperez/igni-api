import os from "os";

import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import throng from "throng";

import config from "./config";

const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: "J.K. Rowling",
  },
];

const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

const resolvers = {
  Query: { books: () => books },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();

const WORKERS = os.cpus().length;

const server = new ApolloServer({
  schema,
  context: async ({ req }) => ({}),
});

server.applyMiddleware({
  path: "/api",
  app,
});

const startServer = async () => {
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    promiseLibrary: global.Promise,
  };
  try {
    await Promise.all([
      mongoose.connect(config.MONGODB_URI, mongooseOptions),
      app.listen(config.PORT),
    ]);
    console.log(`Server has started on port: ${config.PORT}`);
  } catch (error) {
    console.error("Could not start the app: ", error);
  }
};

throng(startServer, {
  workers: WORKERS,
  lifetime: Infinity,
});
