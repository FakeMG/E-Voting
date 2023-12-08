module.exports = (sequelize, DataTypes, models) => {
  const ElectionCandidate = sequelize.define("ElectionCandidate", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.election,
        key: "id",
      },
    },
    candidateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.candidate,
        key: "id",
      },
    },
    votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });

  return ElectionCandidate;
};
