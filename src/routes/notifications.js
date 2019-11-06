const router = require('express').Router()

const { Notification } = require('../models')

router.get('/', (req, res) => (
  Notification.query(qb => qb.orderBy('created', 'DESC')).where({
    targetUserId: req.user.id,
    ...(req.query.seen && { seen: req.query.seen }),
  }).fetchAll({
    withRelated: ['user', 'post'],
  })
    .then(notifications => res.json(notifications))
    .catch(error => res.status(400).send(error))
))

router.put('/', (req, res) => (
  Notification.where({
    targetUserId: req.user.id,
    seen: 0,
  }).save({ seen: 1 }, { patch: true, require: false })
    .then(notifications => res.status(200).send(notifications))
    .catch(error => res.status(400).send(error))
))

module.exports = router
