const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/products');
const multer = require('multer');


const upload = multer({
  storage: multer.memoryStorage()
});

router.get('/', ProductsController.fetch);
router.get('/:id', ProductsController.find);
router.post('/', upload.single('image'), ProductsController.add);
router.put('/:id', upload.single('image'), ProductsController.update);
router.delete('/:id', ProductsController.delete);


module.exports = router;
