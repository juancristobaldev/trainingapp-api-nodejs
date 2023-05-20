const FacebookStrategy = require("passport-facebook");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const passport = require("passport");
const session = require("express-session");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TokenGenerator = require("uuid-token-generator");
const { response } = require("express");

const tokengen = new TokenGenerator(256, TokenGenerator.BASE62);

const { google } = require("googleapis");

const initPassport = (app) => {
  require("dotenv").config({ path: "./.env" });

  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SECRET_EXPRESS_SESSION,
    })
  );

  app.use(passport.initialize());

  app.use(passport.session());

  const findOrCreate = async (id, variables) => {
    let user;

    const userFind = await prisma.users.findUnique({
      where: {
        token: id,
      },
    });

    if (!userFind) {
      user = await prisma.users.create({
        data: {
          ...variables,
        },
      });
    }

    return userFind ? userFind : user;
  };

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_REDIRECT_URL,
        profileFields: [
          "id",
          "displayName",
          "name",
          "emails",
          "picture.type(large)",
        ],
      },
      async function (accessToken, refreshToken, profile, cb) {
        const profileJson = profile._json;

        let variables = {
          first_name: profileJson.first_name,
          last_name: profileJson.last_name,
          email: profileJson.email,
          token: profileJson.id,
          password: profileJson.id.split("").reverse().join(""),
          profile: {
            create: {
              photo: profileJson.picture.data.url,
            },
          },
        };

        const userResponse = await findOrCreate(variables.token, variables);

        cb(null, userResponse);
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL,
        scope: ["profile", "email"],
      },
      async function (accessToken, refreshToken, profile, done) {
        const profileJson = profile._json;

        let variables = {
          first_name: profileJson.given_name,
          last_name: profileJson.family_name,
          email: profileJson.email,
          token: profileJson.sub,
          password: profileJson.sub.split("").reverse().join(""),
          profile: {
            create: {
              photo: profileJson.picture,
            },
          },
        };

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URL
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        const people = google.people({ version: "v1", auth: oauth2Client });

        const response = await people.people.get({
          resourceName: "people/me",
          personFields: "genders,birthdays",
        });

        const { birthdays, genders } = response.data;

        variables = {
          ...variables,
          date: birthdays
            ? `${
                birthdays[0].date.day > 9
                  ? birthdays[0].date.day
                  : `0${birthdays[0].date.day}`
              }-${
                birthdays[0].date.month > 9
                  ? birthdays[0].date.month
                  : `0${birthdays[0].date.month}`
              }-${birthdays[0].date.year}`
            : null,
          gender: genders ? genders[0].value : "undefined",
        };

        const responseUser = await findOrCreate(variables.token, variables);

        done(null, responseUser);
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("serialize:", user);
    done(null, user);
  });

  // Deserialize user from the sessions
  passport.deserializeUser((user, done) => {
    console.log("deserialize:", user);
    done(null, user);
  });
};

module.exports = { initPassport };
