"use strict";
//packages
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const graphql_1 = require("graphql");
const express_graphql_1 = require("express-graphql");
const fs_1 = require("fs");
const path_1 = require("path");
const app = express_1.default();
const cors = require('cors');
//env
require('dotenv').config({ path: './.env' });
app.use(cors());
const resolvers = require('./resolvers');
const schema = graphql_1.buildSchema(fs_1.readFileSync(path_1.join(__dirname, 'schema.graphql'), 'utf-8'));
app.use('/graphql', express_graphql_1.graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
}));
// port
const port = process.env.PORT;
// routes
app.get('/', (req, res) => {
    console.log(req.headers.host);
    res.send('Welcome to my Api in Vercel 🚀 ');
});
// server
app.listen(port, () => {
    console.log(`🚀 Server running at: ${port}`);
});
