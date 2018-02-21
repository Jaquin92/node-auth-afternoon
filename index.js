const express = require("express");
const session = require("express-session");
const passport = require("passport");
const strategy = require("./strategy");
const { secret, clientID } = require("./config");
const request = require("request");

const app = express();
app.use(
  session({
    secret: "@nyth!ng y0u w@nT",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(strategy);

passport.serializeUser((user, done) => {
  const { _json } = user;
  done(null, {
    name: _json.name,
    nickname: _json.nickname,
    picture: _json.picture
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/followers",
    failureRedirect: "/login",
    failureFlash: true,
    connection: "github"
  })
);
app.get("/me", (req, res, next) => {
  if (!req.user) {
    res.redirect("/login");
  } else {
    res.status(200).send(req.user);
  }
});

app.get("/followers", (req, res, next) => {
  console.log(req.user);
  if (req.user) {
    const FollowersRequest = {
      url: `https://api.github.com/users/${req.user.nickname}/followers`, //req.user.followers,
      headers: {
        "User-Agent": clientID
      }
    };

    request(FollowersRequest, (error, response, body) => {
      res.status(200).send(body);
    });
  } else {
    res.redirect("/login");
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
