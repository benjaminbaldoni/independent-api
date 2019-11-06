const router = require('express').Router()

const { Post, LikedUser } = require('../models')
const { imageUpload } = require('../middlewares')

const singleImageUpload = imageUpload.single('image')

router.get('/', (req, res) => (
  LikedUser.where('userId', req.user.id)
    .fetchAll()
    .then(likedUsers => (
      Post.query(qb => qb.orderBy('created', 'DESC')).where('userId', 'IN', [
        ...likedUsers.map(likedUser => likedUser.attributes.likedUserId),
        req.user.id,
      ])
        .fetchAll({ withRelated: ['user', 'comments'] })
        .then(posts => res.json(posts))
    ))
    .catch((error) => {
      res.status(400).send(error)
    })
))

router.get('/own', (req, res) => (
  Post.query(qb => qb.orderBy('created', 'DESC'))
    .where('userId', req.user.id)
    .fetchAll({ withRelated: ['user', 'comments'] })
    .then(posts => res.json(posts))
    .catch((error) => {
      res.status(400).send(error)
    })
))

router.get('/user/:id', (req, res) => (
  Post.query(qb => qb.orderBy('created', 'DESC'))
    .where('userId', req.params.id)
    .fetchAll({ withRelated: ['user', 'comments'] })
    .then(posts => res.json(posts))
    .catch((error) => {
      res.status(400).send(error)
    })
))

router.post('/', singleImageUpload, (req, res) => {
  const {
    comment,
    width,
    height,
  } = req.body

  return new Post({
    userId: req.user.id,
    comment,
    mediaUrl: req.file.transforms[0].location,
    width,
    height,
  })
    .save()
    .then(post => res.json(post))
    .catch((error) => {
      res.status(400).send(error)
    })
})

router.put('/:id', (req, res) => (
  Post.where('id', req.params.id).fetch().then((post) => (
    post.save({
      comment: req.body.comment,
    })
      .then(saved => res.json({ saved }))
  ))
))

router.delete('/:id', (req, res) => (
  Post.where('id', req.params.id).destroy().then(destroyed => res.json({ destroyed }))
))

module.exports = router
