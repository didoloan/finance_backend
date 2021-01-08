const express = require('express');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const createError = require('http-errors');

const app = express()

app.use(cors())

app.use(express.json())

app.use(compression({
    level:6,
    threshold:1000*30
}))

app.use(morgan('dev'))

app.use((req, res, next) =>{
    const error = createError.NotFound('This route doesn\'t exist');
    error.status = 404;
    next(error);
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

module.exports = app;