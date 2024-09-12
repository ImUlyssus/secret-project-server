module.exports = (sequelize, DataTypes) => {
    const orders = sequelize.define(
      "orders",
      {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        purchaseDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        totalTickets: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
      },
      {
        timestamps: true,
        createdAt: false,
        updatedAt: false,
      }
    );
    orders.removeAttribute('userUserId');
    return orders;
  };