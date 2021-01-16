const createError = require('http-errors');
const Customer = require('../models/customer');
const { loginValid, registerValid } = require('../utils/validators');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt_helper');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const client = require('../utils/init_redis');
const { promisify } = require('util');


module.exports = {
    register: async(req, res, next) => {
        try {
            let result = await registerValid.validateAsync(req.body);
            let exists = await Customer.findOne({email:result.email});
            if(exists) throw createError.Conflict(`${result.email} already exists!`);
            let user = new Customer(result)
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
            let result = await loginValid.validateAsync(req.body);
            let user = await Customer.findOne({email:result.email});
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
    forgotPassword: async(req, res, next) => {
        try {
            const validator = Joi.object({email:Joi.string().email()});
            const result = await validator.validateAsync(req.body);
            const user = await Customer.findOne({email:result.email});
            const resetCode = crypto.randomBytes(32).toString('hex');
            client.SET(`reset${user.id}`, resetCode, 'EX', 60*60, (err, reply) => {
                if(err){
                    throw createError.InternalServerError(err.message);
                }
                res.json({id:user.id, resetCode})
            })

        } catch (error) {
            if(error.isJoi) error.status = 422
            next(error)
        }
    },
    resetPassword: async(req, res, next) => {
        try {
            const validator = Joi.object({id:Joi.string().required(), key:Joi.string().required(), password:Joi.string().alphanum().min(8)});
            const result = await validator.validateAsync(req.body);
            const user = await Customer.findById(result.id);
            if(!user.email) next(createError.NotFound('User doesnt exist'))
            // client.GET(`reset${user.id}`, (err, resetkey) => {
            //     if(resetkey!==result.key) throw createError.NotAcceptable('Invalid or expired reset key!')
            // });
            const resetkey = await GET_ASYNC(`reset${user.id}`);
            if(resetkey!==result.key) throw createError.NotAcceptable('Invalid or expired reset key!')
            user.password = result.password;
            await user.save();
        } catch (error) {
            if(error.isJoi) error.status = 422
            next(error);
        }
        res.json({message:'Password reset successfully!'});
    }
}

const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.set).bind(client);