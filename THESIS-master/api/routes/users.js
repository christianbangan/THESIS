const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

//ROUTERS
router.post('/', UserController.login_user);
router.get('/', UserController.getLoginPage);
router.post('/register', UserController.register_user);
router.post('/forgot_password', UserController.forgot_password);
router.patch('/reset_password/:token', checkAuth, UserController.reset_password);
router.get('/reset_password/:token', checkAuth, UserController.reset_passwordTemplate);
router.get('/home', UserController.getHomePage);
//router.get('/getToken')

module.exports = router;
