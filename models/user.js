const { defineModel, DataTypes } = require("firestore-sequelize");

const User = defineModel("users", {
  username: {
    type: DataTypes.STRING,
    required: true,
  },
  password: {
    type: DataTypes.STRING,
    required: true,
  },
  nama: {
    type: DataTypes.STRING,
    required: true,
  },
  nomor_telepon:{
    type: DataTypes.STRING,
    required: true,
  },
  alamat:{
    type: DataTypes.STRING,
    required: true,
  },
  jenis_kelamin:{
    type: DataTypes.STRING
  },
  tempat_lahir:{
    type: DataTypes.STRING,
    required: true,
  },
  tanggal_lahir:{
    type: DataTypes.STRING
  },
  email:{
    type: DataTypes.STRING,
  },
  level:{
    type: DataTypes.STRING,
    required: true,
  },
});

module.exports = User;