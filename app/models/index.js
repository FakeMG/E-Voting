const { Sequelize, DataTypes } = require("sequelize");
// tao db
const sequelize = new Sequelize("voting", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
  define: {
    freezeTableName: true,
  },
});

const db = {};

db.DataTypes = DataTypes;
db.sequelize = sequelize;

db.voter = require("./voter.model.js")(sequelize, DataTypes);
db.candidate = require("./candidate.model.js")(sequelize, DataTypes);
db.election = require("./election.model.js")(sequelize, DataTypes);
// db.electionCandidate = require("./electionCandidate.model.js")(
//   sequelize,
//   DataTypes,
//   db
// );

db.electionVoter = require("./electionVoter.model.js")(
  sequelize,
  DataTypes,
  db
);

db.voter.associate(db);
db.candidate.associate(db);
db.election.associate(db);

module.exports = db;
