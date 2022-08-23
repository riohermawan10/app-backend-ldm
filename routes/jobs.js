const express = require('express');
const router = express.Router();
const JobController = require('../controllers/jobs');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage()
});

router.get('/', JobController.fetch);
router.get('/:id', JobController.find);
router.post('/', JobController.add);
router.put('/:id', JobController.update);
router.delete('/:id', JobController.delete);

router.post('/addUser', JobController.addUser);
router.delete('/deleteUser/:id', JobController.deleteUser);

router.post('/addProduct', JobController.addProduct);
router.patch('/editProduct', JobController.updateProduct);
router.delete('/deleteProduct/:id', JobController.deleteProduct);

router.post('/uploadJobs/', upload.single('image'), JobController.uploadJobs);
router.post('/verify', JobController.updateStatusJob);

module.exports = router;