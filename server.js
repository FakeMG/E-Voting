const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(
  session({
    key: "voterId",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);

app.use("/api/election", require("./app/routers/election.router.js"));
app.use("/api/voter", require("./app/routers/voter.router.js"));
app.use("/api/candidate", require("./app/routers/candidate.router.js"));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});

// chưa login thì không được truy cập
var redirectToLoginPage = (req, res, next) => {
  if (!req.session.user && !req.cookies.user_sid) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const db = require("./app/models");
db.sequelize.sync({ force: true });
