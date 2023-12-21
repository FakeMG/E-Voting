const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors")

var corsOptions = {
  origin: "*",
  method: ['GET', 'POST', 'PUT', 'DELETE']
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const db = require("./app/models");
//db.sequelize.sync({ force: true });
db.sequelize.sync();
