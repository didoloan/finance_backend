const createError = require('http-errors');
const Customer = require('../models/customer');
const { transferValid } = require('../utils/validators')
const {verifyToken} = require('../utils/jwt_helper')



module.exports = {
    transfer: async(req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const token = req.headers['authorization'].split(' ')[1];
        try {
            const drop = await transferValid.validateAsync(req.body);
            const payload = await verifyToken(token);
            const sender = await Customer
        } catch (error) {
            if(error.isJoi) error.status = 422
            next(error);
        }
    },
    deposit: async(req, res, next) => {

    }
}