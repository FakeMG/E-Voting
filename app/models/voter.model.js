module.exports = (sequelize, DataTypes) => {
  const Voter = sequelize.define("Voter", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
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
