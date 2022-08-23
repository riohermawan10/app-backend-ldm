const { defineModel, DataTypes } = require("firestore-sequelize");

const User = defineModel("user", {
  userId: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.NUMBER,
  },
  nomor_telepon: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  }
});

module.exports = User;