const mongoose = require('mongoose');
const app = require('./server');

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser:true, 
    useUnifiedTopology:true,
    useCreateIndex: true,
    poolSize:50
})
.then(() => {
    console.log('mongodb connected.')
})
.catch((err) => console.log(err.message))

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to db')
    app.listen(3000, (err) => {
        if(err) {
            console.error(`Couldn't start server with error ${err}`);
        }
        console.log(`Server started on port ${process.env.PORT}`);
    })
})

mongoose.connection.on('error', (err) => {
    console.log(err.message)
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection is disconnected.')
})

process.on('SIGINT', async () => {
    await app.close()
    await mongoose.connection.close()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await app.close()
    await mongoose.connection.close()
    process.exit(0)
})