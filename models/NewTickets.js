

module.exports = (sequelize, DataTypes) => {
  const newTickets = sequelize.define(
    "newTickets",
    {
      ticketId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      prize: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      round: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      exclude: ["id","userUserId"] // Exclude the 'id' column from INSERT statements
    }
  );

  return newTickets;
};
