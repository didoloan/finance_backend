const Joi = require('@hapi/joi');

const registerValid = Joi.object({
    email: Joi.string().email().required(),
    fname: Joi.string().max(50).required(),
    lname: Joi.string().max(50).required(),
    dob: Joi.date().iso().required(),
    password: Joi.string().alphanum().required(),
})

const loginValid = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().required()
})

const transferValid = Joi.object({
    receiver: Joi.string().email().required(),
    amount: Joi.number().required(),
    comment: Joi.string().max(100)
})

const withdrawValid = Joi.object({
    bank_code: Joi.number().required(),
    account_number: Joi.string().length(10).required(),
    amount: Joi.number().required()
})

const depositValidator = Joi.object({
    amount: Joi.number().required()
});

module.exports = { registerValid, loginValid, transferValid, withdrawValid, depositValidator }