const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/check-email', authController.checkEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;