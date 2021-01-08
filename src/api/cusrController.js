const createError = require('http-errors');
const Customer = require('../models/customer');
const { loginSchema, registerSchema } = require('../utils/validators');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt_helper');


module.exports = {
    register: async(req, res, next) => {
        try {
            let result = await registerSchema.validateAsync(req.body);
            let exists = await User.findOne({email:result.email});
            if(exists) throw createError.Conflict(`${result.email} already exists!`);
            let user = new User(result)
            let savedUser = await user.save();
            let accessToken = await signAccessToken(savedUser.id);
            let refreshToken = await signRefreshToken(savedUser.id);
            res.status(200).json({accessToken, refreshToken});
        } catch (error) {
            if(error.isJoi===true) error.status = 422;
            next(error);
        }      
    },

    login: async(req, res, next) => {
        try {
            let result = await loginSchema.validateAsync(req.body);
            let user = await User.findOne({email:result.email});
            if(!user) throw createError.NotFound('User doesn\'t exist');
            let isMatch = await user.isValidPassword(result.password);
            if(!isMatch) throw createError.Unauthorized('Invalid Username/Password!');
            let accessToken = await signAccessToken(user.id);
            let refreshToken = await signRefreshToken(user.id);
            res.status(200).json({accessToken, refreshToken});
        } catch (error) {
            if(error.isJoi===true) next(createError.BadRequest('Invalid Request!'));
            next(error);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
          const { refreshToken } = req.body;
          if (!refreshToken) throw createError.BadRequest()
          const userId = await verifyRefreshToken(refreshToken)
    
          const accessToken = await signAccessToken(userId)
          const refToken = await signRefreshToken(userId)
          res.send({ accessToken: accessToken, refreshToken: refToken })
        } catch (error) {
          next(error)
        }
    },
  
    logout: async (req, res, next) => {
      try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        client.DEL(userId, (err, val) => {
          if (err) {
            console.log(err.message)
            throw createError.InternalServerError()
          }
          console.log(val)
          res.sendStatus(204)
        })
      } catch (error) {
        next(error)
      }
    },
}