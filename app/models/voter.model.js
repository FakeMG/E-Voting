module.exports = (sequelize, DataTypes) => {
  const Voter = sequelize.define("Voter", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Voter.associate = function (models) {
    Voter.belongsToMany(models.election, {
      through: "ElectionVoter",
      as: "elections",
      foreignKey: "voterId",
    });
  };

  return Voter;
};
