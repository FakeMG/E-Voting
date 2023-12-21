module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define("Candidate", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Mx: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    My: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberOfVote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  Candidate.associate = function (models) {
    Candidate.belongsTo(models.election, {
      foreignKey: "electionId",
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  };

  return Candidate;
};
