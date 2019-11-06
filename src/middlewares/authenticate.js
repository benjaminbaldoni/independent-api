const jwt = require('express-jwt')

const JWTConfig = require('../config/jwt')

module.exports = jwt(JWTConfig)
