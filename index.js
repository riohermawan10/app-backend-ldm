const app = require('./server');
const db = require('./db/connection');
const sequelize = require("firestore-sequelize")
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

var options = {
    swaggerOptions: {
      authAction :{ JWT: {name: "JWT", schema: {type: "apiKey", in: "header", name: "Authorization", description: ""}, value: "Bearer <JWT>"} }
    }
  };

const port = process.env.PORT || process.env.port;
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile, options));
app.listen(port, async () => {
    try {
        await sequelize.initializeApp(db)
        console.log('Connection has been connect in database and server port: ' + port);
    } catch (error) {
        console.error('Unable to connect to the database: ', error.message);
    }
});
