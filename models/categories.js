const { defineModel, DataTypes } = require("firestore-sequelize");

const CategoryChild = defineModel("items", {
  name: {
    type: DataTypes.STRING,
    required: true,
  },
  label: {
    type: DataTypes.STRING,
    required: true,
  },
  icon: {
    type: DataTypes.STRING,
  },
  description:{
    type: DataTypes.STRING,
  }
});

const Categories = defineModel("categories", {
  name: {
    type: DataTypes.STRING,
    required: true,
  },
  label: {
    type: DataTypes.STRING,
    required: true,
  },
  icon: {
    type: DataTypes.STRING,
  },
  description:{
    type: DataTypes.STRING,
  }
},{
  subcollections: [CategoryChild],
});

module.exports = Categories;