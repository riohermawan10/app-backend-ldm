const { defineModel, DataTypes } = require("firestore-sequelize");

const Product = defineModel("product", {
  productId: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  jumlah: {
    type: DataTypes.NUMBER,
  },
  keterangan: {
    type: DataTypes.STRING,
  },
  lokasi_pemasangan: {
    type: DataTypes.STRING,
  }
});

module.exports = Product;