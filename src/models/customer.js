const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');


const customerSchema = new Schema({
    fname: {type:String, required:true},
    lname: {type:String, required:true},
    email: {type:String, unique:true, required:true},
    password: {type:String, required:true},
    balance: {type: Number, default:0.00, required:true},
    joined: {type:Date, default: Date.now}
})

customerSchema.pre('save', async function(next){
    try {
        if(this.isNew){
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
        }
        next();
    } catch (error) {
        next(error);
    }
})


const Customer = mongoose.Model('customer', customerSchema);

module.exports = Customer;