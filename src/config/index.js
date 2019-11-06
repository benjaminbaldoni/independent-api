const configFile = process.env.NODE_ENV === 'production' ? './prod' : './dev'
module.exports = require(configFile)
