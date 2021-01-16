const express = require('express');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const createError = require('http-errors');
const { authRoute, bankRoute, customerRoute } = require('./api/index.router')
require('./utils/init_redis');

const app = express()

app.use(cors())

app.use(helmet())

app.use(express.json())

app.use(compression({
    level:6,
    threshold:1000*30
}))

app.use(morgan('dev'))

app.use('/auth', authRoute);

app.use('/bank', bankRoute);

app.use('/customer', customerRoute);

app.use((req, res, next) =>{
    const error = createError.NotFound('This route doesn\'t exist');
    error.status = 404;
    next(error);
})

app.use((err, req, res, next) => {
    res.json({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

module.exports = app;