const redis = require('redis');

const client = redis.createClient({
  port: process.env.ENV=='DEV'?6379:11263,
  host: process.env.ENV=='DEV'?'127.0.0.1':'0.tcp.ngrok.io',
})

client.on('connect', () => {
  console.log('Client connected to redis...')
})

client.on('ready', () => {
  console.log('Client connected to redis and ready to use...')
})

client.on('error', (err) => {
  console.log(err.message)
})

client.on('end', () => {
  console.log('Client disconnected from redis')
})

process.on('SIGINT', () => {
  client.quit()
})

module.exports = client