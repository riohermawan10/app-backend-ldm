const jwt = require('jsonwebtoken');
const response = require('../utils/response');

const verification = async (req, res, next) => {
  /*
    #swagger.auto = false;
    
  */
  try {

    let bearerToken = req.headers.authorization;
    if (!bearerToken) {
      return res.status(401).json(response.auth('Authorization Required!'));
    }

    let token = bearerToken.split(' ')[1];
    let jwtData = await jwt.verify(token, Buffer.from('Cl!ent-S3cR#t', 'base64'));
    // if (jwtData.user.level !== 'Admin') {
    //   return res.status(401).json(response.auth('Invalid to Access!'));
    // }
    
    next();

    /* 
    #swagger.responses[401] = { 
      description: 'Unauthorized',
      schema: {
        resCode: 401,
        resDesc: 'Authorization Required!'
      } 
    }
    */

  } catch (err) {
    return res.status(400).json(response.bad(err));
  }
}

module.exports = {
  verification
}