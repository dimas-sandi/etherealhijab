const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');

router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);
router.post('/google', customerAuthController.googleLogin);

module.exports = router;
