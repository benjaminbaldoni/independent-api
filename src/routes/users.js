const router = require('express').Router()

const { imageUpload, pushNotification } = require('../middlewares')
const { User, LikedUser } = require('../models')

const singleImageUpload = imageUpload.single('avatar')

const isUserLiked = (user, ownUserId) => (
  user.relations.likedBy.filter(likedByUser => likedByUser.attributes.userId === ownUserId).length > 0
)

const extendUsers = (users, ownUserId) => (
  users.map(user => Object.assign(user.attributes, {
    isLiked: isUserLiked(user, ownUserId),
  }))
)

router.get('/', (req, res) => (
  User.where('id', '!=', req.user.id).fetchAll({
    withRelated: ['likedBy'],
  })
    .then(users => res.json(extendUsers(users, req.user.id)))
    .catch(error => res.status(400).send(error))
))

router.get('/me', (req, res) => User
  .where('id', req.user.id)
  .fetch()
  .then(user => res.status(200).send(user))
  .catch(error => res.status(400).send(error))
)

router.put('/me', singleImageUpload, (req, res) => {
  const {
    user,
    body,
    file = {},
  } = req

  return new User({ id: user.id })
    .save({
      profileName: body.profileName,
      avatarUrl: (file.transforms && file.transforms[0].location) || body.avatar.uri,
    }, { patch: true })
    .then(updatedUser => res.status(200).send(updatedUser))
    .catch(error => res.status(400).send(error))
})

router.post('/register', (req, res) => (
  new User({ id: req.user.id })
    .save({
      expoToken: req.body.expoToken,
    }, { patch: true })
    .then(updatedUser => res.status(200).send(updatedUser))
    .catch(error => res.status(400).send(error))
))

router.get('/like/:id', (req, res) => (
  User.where('id', req.params.id).fetch({
    withRelated: ['likedBy'],
  }).then(user => res.json(isUserLiked(user, req.user.id)))
))

// TO.DO: The pushNotification middleware should be placed at the end, but for some reason it's not being called
// probably something to do with returning res.json(likedUser)?
// or maybe should return next() after saving LikedUser?
router.post('/like', pushNotification('NEW_FOLLOWER'), (req, res) => (
  new LikedUser({
    userId: req.user.id,
    likedUserId: req.body.userId,
  })
    .save()
    .then(likedUser => res.json(likedUser))
    .catch((error) => {
      res.status(400).send(error)
    })
))

router.delete('/like/:id', (req, res) =>
  LikedUser.where({
    userId: req.user.id,
    likedUserId: req.params.id,
  })
    .destroy()
    .then(() => res.status(200).send())
    .catch(error => res.status(400).send(error))
)

module.exports = router
