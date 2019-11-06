const bookshelf = require('../bookshelf')

module.exports = bookshelf.model('Comment', {
  tableName: 'comments',
  user() {
    return this.belongsTo('User', 'userId')
  },
})

