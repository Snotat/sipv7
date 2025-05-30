require('dotenv').config()
console.log('dotenv', require('dotenv').config())
const PORT = process.env.PORT || 8000
const MONGODB_URI = process.env.MONGO_URI
const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
    MONGODB_URI,
    PORT,
    JWT_SECRET
}