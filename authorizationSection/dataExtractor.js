const Business = require("../models/businessSchema")
const { JWT_SECRET } = require("../utils/config")

const jwt = require("jsonwebtoken")

const userExtractor = async (request, response, next) => {
    if (request.token) {
        let decodedToken = jwt.verify(request.token, JWT_SECRET)
        let user = await Business.findById(decodedToken.id);
        console.log("userExtractor", user)
        request.user = user
    }
    next()
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        let token = authorization.replace('Bearer ', '')
        console.log('tokenExtractor', token)
        request.token = token
        next()
    } else {
        response.status(401).json({ message: 'Unauthorized Access' })
    }
}

module.exports = { tokenExtractor, userExtractor }