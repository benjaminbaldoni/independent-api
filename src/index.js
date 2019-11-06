const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const { authenticate } = require('./middlewares')
const authRoute = require('./routes/auth')
const commentsRoute = require('./routes/comments')
const imagesRoute = require('./routes/images')
const notificationsRoute = require('./routes/notifications')
const usersRoute = require('./routes/users')
const postsRoute = require('./routes/posts')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride())

app.use((req, res, next) => {
  const origin = req.get('origin')

  res.header('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma') // eslint-disable-line max-len

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
  } else {
    next()
  }
})

app.use('/users', authRoute, authenticate, usersRoute)
app.use('/comments', authenticate, commentsRoute)
app.use('/images', imagesRoute)
app.use('/notifications', authenticate, notificationsRoute)
app.use('/posts', authenticate, postsRoute)

app.get('/', (req, res) => res.send('---Listening'))

app.listen(process.env.PORT || 3000, () => (
  console.log('Node server running on http://localhost:3000')
)) // eslint-disable-line no-console
