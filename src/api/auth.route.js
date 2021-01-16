const { Router } = require('express');
const { login, register, refreshToken, logout, forgotPassword, resetPassword } = require('./authController');

const router = Router();

router.post('/login', login);

router.post('/register', register);

router.post('/refresh', refreshToken);

router.post('/logout', logout)

router.post('/forgot', forgotPassword)

router.post('/reset-password', resetPassword)

module.exports = router;
