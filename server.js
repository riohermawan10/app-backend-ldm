const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const { expressJwt } = require('express-jwt');
const auth = require('./middleware/verify');

const app = express();

const UserRouting = require('./routes/user');
const JobRouting = require('./routes/jobs');
const ProductsRouting = require('./routes/products');
const CategoryRouting = require('./routes/categories');
const LoginRouting = require('./routes/login');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/login', LoginRouting);
app.use('/api/users/', auth.verification, UserRouting);
app.use('/api/jobs/', auth.verification, JobRouting);
app.use('/api/categories/', auth.verification, CategoryRouting);
app.use('/api/products/', auth.verification, ProductsRouting);

module.exports = app;
