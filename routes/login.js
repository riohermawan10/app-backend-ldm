const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/login');

router.post('/', LoginController.login);
// router.get('/:id', UserController.findById);

module.exports = router;