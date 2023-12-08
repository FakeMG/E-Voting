module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define("Candidate", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Candidate.associate = function (models) {
    Candidate.belongsToMany(models.election, {
      through: "ElectionCandidate",
      as: "elections",
      foreignKey: "candidateId",
    });
  };

  return Candidate;
};
