const router = require('express').Router();
const CheckController = require('../controllers/CheckController')

router.route('/check/photo/new').post(CheckController.postNewCheckPhoto)

module.exports = router;