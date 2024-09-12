module.exports = (sequelize, DataTypes) => {
    const notifications = sequelize.define(
      "notifications",
      {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        }
      },
      {
        timestamps: true,
        createdAt: false,
        updatedAt: false
      }
    );
    // notifications.removeAttribute('id');
    return notifications;
  };
  