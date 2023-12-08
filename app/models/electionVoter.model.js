module.exports = (sequelize, DataTypes, models) => {
  const ElectionVoter = sequelize.define("ElectionVoter", {
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
      voterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: models.voter,
          key: "id",
        },
      },
    },
    // other fields of the joined table
  });
  return ElectionVoter;
};
