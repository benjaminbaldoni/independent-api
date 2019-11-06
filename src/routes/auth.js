const router = require('express').Router()
const jwtBuilder = require('jsonwebtoken')

const { User } = require('../models')
const JWTConfig = require('../config/jwt')

const getUserWithToken = user => Object.assign({}, user, {
  token: jwtBuilder.sign(user, JWTConfig.secret),
})

router.post('/', (req, res) => {
  const { profileName, emailAddress, password } = req.body

  return new User({
    profileName,
    emailAddress,
    password,
  })
    .save()
    .then(user => res.status(200).send(getUserWithToken(user.attributes)))
    .catch(error => res.status(400).send(error))
})

router.post('/auth', (req, res) => User
  .forge({ emailAddress: req.body.emailAddress })
  .fetch()
  .then(user => user.authenticate(req.body.password))
  .then(user => res.status(200).send(getUserWithToken(user.attributes)))
  .catch(error => res.status(400).send(error))
)


module.exports = router
