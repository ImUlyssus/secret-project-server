module.exports = (sequelize, DataTypes) => {
    const oldTickets = sequelize.define(
      "oldTickets",
      {
        ticketId: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        purchaseDate: {
            type: DataTypes.DATE,
            allowNull: false,
            primaryKey: true
        },
        prize: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        paid: {
          type: DataTypes.BOOLEAN,
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
        exclude: ["id"] // Exclude the 'id' column from INSERT statements
      }
    );
    oldTickets.removeAttribute('id');
    return oldTickets;
  };
  