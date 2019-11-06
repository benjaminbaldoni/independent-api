const bookshelf = require('../bookshelf')

const LikedUser = require('./LikedUser')

module.exports = bookshelf.model('User', {
  tableName: 'users',
  hasSecurePassword: 'secret',
  likedBy() {
    return this.hasMany(LikedUser, 'likedUserId')
  },
})
