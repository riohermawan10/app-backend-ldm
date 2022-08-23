const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

router.get('/', UserController.fetch);
router.get('/:id', UserController.findById);
router.post('/', UserController.add);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
