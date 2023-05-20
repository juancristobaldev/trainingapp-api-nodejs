//packages

const express = require("express");
const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const { readFileSync } = require("fs");
const { join } = require("path");
const { initPassport } = require("./lib/passport/initPassport");

const session = require("express-session");

const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

//env

require("dotenv").config({ path: "./.env" });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const resolvers = require("./lib/resolvers");
const passport = require("passport");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET_EXPRESS_SESSION,
  })
);

const schema = buildSchema(
  readFileSync(join(__dirname, "/lib/", "schema.graphql"), "utf-8")
);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

initPassport(app);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    session: true,
  }),
  (req, res) => {
    console.log(req.user);

    res.redirect(`/success?response=${JSON.stringify(req.user)}`);
  }
);

app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    session: true,
  }),
  (req, res) => {
    res.redirect(`/success?response=${JSON.stringify(req.user)}`);
  }
);

app.get("/success", (req, res) => {
  res.send({ success: "true" });
});

// port

const port = process.env.PORT;

// routes

app.get("/", (req, res) => {
  res.send("Welcome to my Api in Vercel 🚀 ");
});

// server
app.listen(port, () => {
  console.log(`🚀 Server running at: ${port}`);
});
