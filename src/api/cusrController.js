const createError = require('http-errors');
const Customer = require('../models/customer');
const { loginSchema, registerSchema } = require('../utils/validators');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt_helper');