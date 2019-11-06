const bookshelf = require('../bookshelf')

module.exports = bookshelf.model('LikedUser', {
  tableName: 'likedUsers',
  user() {
    return this.belongsTo('User')
  },
  likedUser() {
    return this.belongsTo('User')
  },
})
