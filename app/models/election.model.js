module.exports = (sequelize, DataTypes) => {
  const Election = sequelize.define("Election", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Election.associate = function (models) {
    Election.belongsToMany(models.candidate, {
      through: "ElectionCandidate",
      as: "candidates",
      foreignKey: "electionId",
    });

    Election.belongsToMany(models.voter, {
      through: "ElectionVoter",
      as: "voters",
      foreignKey: "electionId",
    });
  };

  return Election;
};
