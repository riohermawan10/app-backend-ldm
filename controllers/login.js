const bcrypt = require('bcryptjs');
const User = require("../models/user");
const response = require('../utils/response');
const message = require('../utils/responseMessage');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {

  /*
    #swagger.tags = ['Login']
    #swagger.summary = 'Login first to get acccess token'
  */

  const { username, password } = req.body;
  try {

    const findUser = await User.findOne({
      where: {
        username: username
      }
    });

    if (!findUser) {
      return res.status(404).json(response.nodeFound(`User Not Found!`));
    }

    let users = {
      id: findUser.getId(),
      username: findUser.username,
      nama: findUser.nama,
      level: findUser.level
    };

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return res.status(401).json(response.auth(`Password Not Match!`));
    }

    const token = jwt.sign({ user: users },  Buffer.from('Cl!ent-S3cR#t', 'base64'), {expiresIn: '5h'});
    const result = {
      id: users.id,
      access_token: token,
      access_type: 'Bearer',
      expires: '5h',
      role: users.level,
      name: users.nama
    }

    return res.status(200).json(response.ok(result, message.login));

    /*
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/definitions/Login" },
            examples: { 
              Login: { $ref: "#/components/examples/Login" }
            }
          }
        }
      }

      #swagger.responses[200] = {
        description: 'Successful operation.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                access_token: {
                  type: 'string',
                },
                access_type: {
                  type: 'string',
                },
                expires: {
                  type: 'string',
                },
                role: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                }
              }
            }
          }
        }
      }

      #swagger.responses[401] = {
        description: 'Unauthorized.',
        schema: {
          resCode: 401,
          resDesc: 'Password Not Match!.'
        }
      }

      #swagger.responses[404] = {
        description: 'Not Found.',
        schema: {
          resCode: 404,
          resDesc: 'User Not Found!.'
        }
      }

      #swagger.responses[400] = {
        description: 'Bad Request.',
        schema: {
          resCode: 400,
          resDesc: 'Bad Request!.'
        }
      }

    */


  } catch (err) {
    return res.status(400).json(response.bad(err));
  }
}