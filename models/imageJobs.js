const { defineModel, DataTypes } = require("firestore-sequelize");

const Image = defineModel("image", {
  thumbnail: {
    type: DataTypes.STRING,
  },
  thumbnailPath: {
    type: DataTypes.STRING,
  },
  keterangan: {
    type: DataTypes.STRING,
  }
});

module.exports = Image;