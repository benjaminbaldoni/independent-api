const bookshelf = require('../bookshelf')

const User = require('./User')
const Post = require('./Post')

module.exports = bookshelf.model('Notication', {
  tableName: 'notifications',
  user() {
    return this.belongsTo(User, 'userId')
  },
  targetUser() {
    return this.belongsTo(User, 'targetUserId')
  },
  post() {
    return this.belongsTo(Post, 'postId')
  },
})
