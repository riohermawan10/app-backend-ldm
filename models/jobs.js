const { defineModel, DataTypes } = require("firestore-sequelize");
const Image = require('./imageJobs');
const Product = require('./productJobs');
const User = require('./userJobs');

const Job = defineModel("jobs", {
  deskripsi: {
    type: DataTypes.STRING,
    required: true,
  },
  detail: {
    type: DataTypes.STRING,
    required: true,
  },
  alamat: {
    type: DataTypes.STRING,
  },
  catatan:{
    type: DataTypes.STRING,
  },
  no_telpon_pic: {
    type: DataTypes.STRING,
  },
  pic_gedung: {
    type: DataTypes.STRING,
  },
  tanggal_pemasangan: {
    type: DataTypes.STRING,
  },
  status_teknisi: {
    type: DataTypes.STRING,
    default: "Pending",
  },
  status_supervisor: {
    type: DataTypes.STRING,
    default: "Pending",
  },
  status_job: {
    type: DataTypes.BOOLEAN,
    default: false,
  }
},{
  subcollections: [Image, Product, User],
});

module.exports = Job;