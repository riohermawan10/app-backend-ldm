const bcrypt = require('bcryptjs');
const User = require("../models/user");
const response = require('../utils/response');
const message = require('../utils/responseMessage');

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? ++page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, rows, totalPages, currentPage };
};

exports.fetch = async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Fetch all users'
    #swagger.security = [{
      "Token": []
    }]
  */
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page-1, size);
  try {
      const findUser = await User.findAll({ where: {}, limit: limit, offset: offset });

      const allUser = await User.findAll({});

      let result = [];
      for (let i = 0; i < findUser.length; i++) {
        
        result.push({
          id: findUser[i].getId(),
          username: findUser[i].username,
          password: findUser[i].password,
          nama: findUser[i].nama,
          nomor_telepon: findUser[i].nomor_telepon,
          alamat: findUser[i].alamat,
          jenis_kelamin: findUser[i].jenis_kelamin,
          tempat_lahir: findUser[i].tempat_lahir,
          tanggal_lahir: findUser[i].tanggal_lahir,
          email: findUser[i].email,
          level: findUser[i].level
        })
        
      }

      let data = {
        count: allUser.length,
        rows: result
      }
      const responses = getPagingData(data, page-1, limit);

      /* #swagger.responses[200] = {
            description: 'Successful operation.',
            schema: {
                resCode: "200",
                resDesc: "Fetch All success!",
                values: {
                    totalItems: 1,
                    rows: [
                        { $ref: '#/definitions/User' }
                    ],
                    totalPages: 1,
                    currentPage: 1
              }
          }
        }

        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

        */

      return res.status(200).json(response.ok(responses, message.fetch));
      // return res.status(200).json(responses);
  } catch (err) {
      return res.status(400).json(err.message);
  }

}

exports.findById = async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Find user by id'
    #swagger.security = [{
      "Token": []
    }]
  */
  const userId = req.params.id;
  try {
      const findUser = await User.findOne({
          id: userId,
      });

      if(!findUser){
        return res.status(404).json(response.nodeFound(`User Not Found!`));
      }

      let user =  {
        id: findUser.getId(),
        username: findUser.username,
        nama: findUser.nama,
        nomor_telepon: findUser.nomor_telepon,
        alamat: findUser.alamat,
        jenis_kelamin: findUser.jenis_kelamin,
        tempat_lahir: findUser.tempat_lahir,
        tanggal_lahir: findUser.tanggal_lahir,
        email: findUser.email,
        level: findUser.level
      };
      
      /*
        #swagger.parameters['id'] = {
          in: 'path',
          required: true,
          description: 'Users id',
        }
        
        #swagger.responses[200] = {
            description: 'Successful operation.',
            schema: {
                resCode: "200",
                resDesc: "Inquiry success!",
                values: {
                  $ref: '#/definitions/User'
                }
              }
          }
        }

        #swagger.responses[404] = {
            description: 'User not found.',
            schema: {
                resCode: "404",
                resDesc: "User Id Not Found!"
              }
          }
         
        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }
      */
      
      return res.status(200).json(response.ok(user, message.inquiry));
      // res.status(200).json(findUser);

  } catch (err) {
      return res.status(404).json(response.bad(err.message));
  }
};

exports.add = async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Add new user'
    #swagger.security = [{
      "Token": []
    }]
  */
  try {
      const { username, password, nama, nomor_telepon, alamat, jenis_kelamin, tempat_lahir, tanggal_lahir, email, level } = req.body;
      const hashPassword = await bcrypt.hash(password, 12);

      const findUsername = await User.findOne({
        where: {
          username: username
        }
      });

      if (findUsername) {
        return res.status(422).json(response.bad(`Username ${findUsername.username} exists!`));
      }

      const saveUser = await User.create({
          username: username,
          password: hashPassword,
          nama: nama,
          nomor_telepon: nomor_telepon,
          alamat: alamat,
          jenis_kelamin: jenis_kelamin,
          tempat_lahir: tempat_lahir,
          tanggal_lahir: tanggal_lahir,
          email: email,
          level: level
      });

      const findUser = await User.findOne({
        id: saveUser.getId()
      });

      let user = {
        id: findUser.getId(),
        username: findUser.username,
        nama: findUser.nama,
        nomor_telepon: findUser.nomor_telepon,
        alamat: findUser.alamat,
        jenis_kelamin: findUser.jenis_kelamin,
        tempat_lahir: findUser.tempat_lahir,
        tanggal_lahir: findUser.tanggal_lahir,
        email: findUser.email,
        level: findUser.level
      }

      /* 
       #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/User" },
              examples: { 
                User: { $ref: "#/components/examples/User" }
              }
            }
          }
        }
        
        #swagger.responses[201] = {
            description: 'Successful created user.',
            schema: {
                resCode: "201",
                resDesc: "Create success!",
                values: {
                  $ref: '#/definitions/User'
                }
              }
        }

        #swagger.responses[400] = {
          description: 'Bad Request.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

        #swagger.responses[422] = {
          description: 'User already exists.',
          schema: {
            resCode: "422",
            resDesc: "User already exists!"
          }
        }
        
      */

      return res.status(201).json(response.create(user, message.create));
      // res.status(201).json(req.body);
  } catch (err) {
      return res.status(400).json(err.message);
      // console.log(err);
  }
}

exports.update = async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Update user'
    #swagger.security = [{
      "Token": []
    }]
  */
  try {
      const {nama, nomor_telepon, alamat, jenis_kelamin, tempat_lahir, tanggal_lahir, email, level } = req.body;
      const id = req.params.id;
      const findUser = await User.findOne({
        id: id
      });
      
      if(!findUser){
          return res.status(404).json(response.nodeFound(`User Id ${id} Not Found!`));
      }

      findUser.nama = nama ? nama : findUser.nama;
      findUser.nomor_telepon = nomor_telepon ? nomor_telepon : findUser.nomor_telepon;
      findUser.alamat = alamat ? alamat : findUser.alamat;
      findUser.jenis_kelamin = jenis_kelamin ? jenis_kelamin : findUser.jenis_kelamin;
      findUser.tempat_lahir = tempat_lahir ? tempat_lahir : findUser.tempat_lahir;
      findUser.tanggal_lahir = tanggal_lahir ? tanggal_lahir : findUser.tanggal_lahir;
      findUser.email = email ? email : findUser.email;
      findUser.level = level ? level : findUser.level;

      await findUser.save();

      const getUser = await User.findOne({
          id: id
      });

      let user = {
        id: getUser.getId(),
        username: getUser.username,
        nama: getUser.nama,
        nomor_telepon: getUser.nomor_telepon,
        alamat: getUser.alamat,
        jenis_kelamin: getUser.jenis_kelamin,
        tempat_lahir: getUser.tempat_lahir,
        tanggal_lahir: getUser.tanggal_lahir,
        email: getUser.email,
        level: getUser.level
      }

      /*
        #swagger.parameters['id'] = {
          in: 'path',
          required: true,
          description: 'Users id',
        } 

        #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/User" },
            }
          }
        }

        #swagger.responses[201] = {
            description: 'Successful operation.',
            schema: {
                resCode: "201",
                resDesc: "Update success!",
                values: {
                  $ref: '#/definitions/User'
                }
              }
          }
        }

        #swagger.responses[404] = {
            description: 'User not found.',
            schema: {
                resCode: "404",
                resDesc: "User Id Not Found!"
              }
         }

        #swagger.responses[400] = {
          description: 'Bad Request!.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }
         
      */

      return res.status(201).json(response.create(user,'Update Success!'));
  } catch (err) {
      return res.status(400).json(response.bad(err.message));
  }
}

exports.delete = async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.summary = 'Delete user'
    #swagger.security = [{
      "Token": []
    }]
  */
  try {
      const id = req.params.id;
      const findUser = await User.findOne({
        id: id
      });
      if (!findUser) {
          return res.status(404).json(response.nodeFound('User Not Found!'));
      }
      const deleteUser = await findUser.destroy();
      if (deleteUser) {
          return res.status(200).json(response.okDelete(`User ${findUser.nama} Success Deleted!`));
      }

      /*

        #swagger.parameters['id'] = {
          in: 'path',
          required: true,
          description: 'Users id',
        }

        #swagger.responses[200] = {
          description: 'Success operation.',
          schema: {
              resCode: "200",
              resDesc: "User success deleted!"
            }
         }

        #swagger.responses[404] = {
          description: 'ID not found.',
          schema: {
              resCode: "404",
              resDesc: "User Id Not Found!"
            }
         }

        #swagger.responses[400] = {
          description: 'Bad Request!.',
          schema: {
            resCode: "400",
            resDesc: "Bad Request!"
          }
        }

      */

  } catch (err) {
      return res.status(400).json(response.bad(err.message));
  }
}