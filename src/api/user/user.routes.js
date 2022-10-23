const router = require('express').Router();
const userController = require('./user.controller');
const { auth } = require('../../utils/auth');

router.route('/').post(userController.signup);
router.route('/login', auth).post(userController.login);
router.route('/', auth).get(userController.showSingleUser)

module.exports = router;
