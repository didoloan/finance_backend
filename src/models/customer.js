const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const beneficiarySchema = new Schema({
    bank_code: {type:String, required:true},
    acct_no: {type:String, required:true}
})

const customerSchema = new Schema({
    fname: {type:String, required:true},
    lname: {type:String, required:true},
    email: {type:String, unique:true, required:true},
    dob: {type:Date, required:true},
    password: {type:String, required:true},
    balance: {type: Number, default:0.00},
    joined: {type:Date, default: Date.now},
    beneficiaries: [beneficiarySchema]
})

customerSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}

customerSchema.methods.fullname = function() {
    return `${this.fname} ${this.lname}`;
}

customerSchema.pre('save', async function(next){
    try {
        if(this.isNew || this.isModified('password')){
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
        }
        next();
    } catch (error) {
        next(error);
    }
})


const Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;