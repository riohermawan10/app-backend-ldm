const { defineModel, DataTypes } = require("firestore-sequelize");
const { Categories } = require("./categories");
// const { User } = require("./user");

const User = defineModel("users", {
  userId : '',
  name : '', 
});

const Category = defineModel("categories", {
  categoryId : '',
  name : '', 
});

const Products = defineModel("products", {
  title: {
    type: DataTypes.STRING,
    required: true,
  },
  description: {
    type: DataTypes.STRING,
    required: true,
  },
  price: {
    type: DataTypes.NUMBER,
    required: true,
  },
  weight: {
    type: DataTypes.NUMBER,
    required: true,
  },
  stock:{
    type: DataTypes.NUMBER,
    required: true,
  },
  thumbnail:{
    type: DataTypes.STRING,
  },
  thumbnailPath:{
      type: DataTypes.STRING,
  },
  totalIn:{
      type: DataTypes.NUMBER,
  },
  totalOut:{
      type: DataTypes.NUMBER,
      default: 0,
  },
},{
  subcollections: [User, Category],
});

module.exports = Products;