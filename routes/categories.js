const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categories');

// router.get('/', OAuth.verification, UserController.findAllUser);
router.get('/', CategoryController.fetch);
router.get('/getParent', CategoryController.parent);
router.get('/:id', CategoryController.findById);
router.post('/', CategoryController.add);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);


module.exports = router;
