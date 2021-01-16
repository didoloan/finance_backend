const { Router } = require('express');
const Customer =  require('../models/customer')

const router = Router();

router.post('/user/:email').post(async(req, res, next) => {
    const user = await Customer.findOne({email: email});
    res.json({result:user});
})

module.exports = router;
