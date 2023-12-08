const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/election", require("./app/routers/election.router.js"));
app.use("/api/voter", require("./app/routers/voter.router.js"));
app.use("/api/candidate", require("./app/routers/candidate.router.js"));

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const db = require("./app/models");
db.sequelize.sync({ force: true });
