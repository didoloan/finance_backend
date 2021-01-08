const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const trans = require('../constants/transactions');

const transactionSchema = new Schema({
    transaction: {
        type:String, 
        enum:[
            trans.deposit, 
            trans.withdrawal, 
            trans.transfer, 
            trans.purchase], 
        required:true
    },
    sender: {type:Types.ObjectId, required:true},
    receiver: {type:Types.ObjectId, required:true},
    amount: {type:Number, required:true},
    date: {type:Date, default:Date.now},
    comment: String
})

const Transaction = mongoose.model('transaction', transactionSchema);

module.exports = Transaction;