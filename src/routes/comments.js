const express = require('express')

const { pushNotification } = require('../middlewares')
const { Comment } = require('../models')

const router = express.Router()

router.get('/', (req, res) => (
  Comment.where('postId', req.query.postId).fetchAll({ withRelated: 'user' })
    .then(comments => res.json(comments))
    .catch((error) => {
      res.status(400).send(error)
    })
))

// TO.DO: The pushNotification middleware should be placed at the end (view whole issue in ./users.js)
router.post('/', pushNotification('NEW_COMMENT'), (req, res) => (
  new Comment({
    content: req.body.content,
    userId: req.user.id,
    postId: req.body.postId,
  })
    .save()
    .then(comment => res.json(comment))
    .catch((error) => {
      res.status(400).send(error)
    })
))

router.delete('/:id', (req, res) => {
  Comment.where('id', req.params.id).destroy().then(destroyed => res.json({ destroyed }))
})

module.exports = router
