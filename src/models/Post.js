const bookshelf = require('../bookshelf')

const User = require('./User')

module.exports = bookshelf.model('Post', {
  tableName: 'posts',
  user() {
    return this.belongsTo(User, 'userId')
  },
  comments() {
    return this.hasMany('Comment', 'postId')
  },
})
