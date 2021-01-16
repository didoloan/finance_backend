const createError = require('http-errors');
const mongoose = require('mongoose');
const ObjectId = require('bson');
const Customer = require('../models/customer');
const Transaction = require('../models/transactions');
const { transferValid, withdrawValid, depositValidator } = require('../utils/validators')
const ttype = require('../constants/transactions');
const {verifyToken} = require('../utils/jwt_helper');
const { promisify } = require('util');
const client = require('../utils/init_redis');
const Joi = require('@hapi/joi');
const axios = require('axios');

module.exports = {
    transfer: async(req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const token = req.headers['authorization'].split(' ')[1];
        try {
            const session = await mongoose.startSession();
            session.startTransaction()
            const drop = await transferValid.validateAsync(req.body);
            const payload = await verifyToken(token);
            const sender = await Customer.findById(payload.aud).session(session);
            const receiver = await Customer.findOne({'email':drop.receiver}, {session:session});
            if(sender.balance<drop.amount) return next(createError.BadRequest('Insufficient balance!'))

            sender.balance -= drop.amount;
            receiver.balance += drop.amount;
            sender.save();receiver.save();
            const transaction = await Transaction.create({transaction:ttype.transfer, amount:drop.amount, sender:sender._id, receiver: receiver._id, comment:drop.comment}, {session:session});
            session.commitTransaction();
            session.endSession();
        } catch (error) {
            if(error.isJoi) error.status = 422
            next(error);
        }
        res.json({message: 'Transfer completed successfully!'});
    },
    deposit: async(req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const token = req.headers['authorization'].split(' ')[1];
        try {
            const depo = await depositValidator.validateAsync(req.body);
            const payload = await verifyToken(token);
            const user = await Customer.findById(payload.aud);
            const reply = await SET_ASYNC('deposit'+pauload.aud, depo.amount, 'EX', 24*60*60);
            const reqObj = {
                "tx_ref":crypto.randomBytes(32).toString('hex'),
                "amount":depo.amount,
                "currency":"NGN",
                "redirect_url":"https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
                "payment_options":"bank_transfer",
                "customer":{
                   "email":user.email,
                   "phonenumber":user.phonenumber,
                   "name":user.fullname
                },
                "customizations":{
                   "title":"RealFinance Topup",
                   "description":"Make payment to topup your account",
                   "logo":`${process.env.frontend}/logo.png`
                }
            }
            const response = await axios.post(process.env.PAYMENT_GATEWAY, reqObj, {headers: requestHeader})
            if(response.data.status === 'success')
        } catch (error) {
            if(error.isJoi) error.status = 422
            next(error);  
        }
    },
    withdraw: async(req, res, next) => {
        try {
            const withdraw = await withdrawValid.validateAsync(req.body);

        } catch (error) {
            if(error.isJoi) error.status = 422
            next(error);
        }
    }
}

const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.set).bind(client);

const requestHeader = {
    'authorization': process.env.FWV_TOKEN,
    'content-type': 'application/json'
}