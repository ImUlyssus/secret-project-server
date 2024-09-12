

module.exports = (sequelize, DataTypes) => {
    const contactUs = sequelize.define(
      "contactUs",
      {
        date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        userName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isResponded: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
      },
      {
        timestamps: true,
        createdAt: false,
        updatedAt: false,
      }
    );
    return contactUs;
  };