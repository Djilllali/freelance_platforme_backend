const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { ExtractJwt } = require("passport-jwt");
const User = require("../models/user");
const Admin = require("../models/admin");
const {
  JWTSECRET,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
} = require("../utils/constants");
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: JWTSECRET,
    },
    async (payload, done) => {
      try {
        User.findById(payload.sub).then((usr) => {
          if (!usr) {
            done(null, false);
          } else {
            done(null, usr);
          }
        });
      } catch (err) {
        done(err, false);
      }
    }
  )
);
passport.use(
  "admin-jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: JWTSECRET,
    },
    async (payload, done) => {
      try {
        Admin.findById(payload.sub).then((usr) => {
          if (!usr) {
            done(null, false);
          } else {
            done(null, usr);
          }
        });
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8090/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log("profile id !!!!!!", profile.id);
      User.findOne({ googleId: profile.id }, async (err, user) => {
        if (err)  return done(new Error("Could not login"), null);
        let r = (Math.random() + 1).toString(36).substring(7);

        if (!user) {
          let createdUser = new User({
            email: profile.emails[0].value,
            name: profile.name.givenName,
            googleId: profile.id,
            password: r,
          });
          let createdUserResult = await createdUser.save();
          if (!createdUserResult) {
            return done(new Error("Could not register"), null);
          }
          return done(err, createdUserResult);
        }
        return done(err, user);
      });
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
