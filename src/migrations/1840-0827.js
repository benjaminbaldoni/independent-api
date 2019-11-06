const tableNames = {
  USERS: 'users',
  COMMENTS: 'comments',
  POSTS: 'posts',
  LIKED_USERS: 'likedUsers',
  NOTIFICATIONS: 'notifications',
}

const createUsersTable = knex => (table) => {
  table.increments('id').primary()
  table.string('secret').notNullable()
  table.string('emailAddress').notNullable()
  table.string('profileName')
  table.string('avatarUrl')
  table.datetime('joined').defaultTo(knex.fn.now())
  table.string('expoToken')
}

const createPostsTable = knex => (table) => {
  table.increments('id').primary()
  table.integer('userId').unsigned().notNullable()
  table.string('comment')
  table.string('mediaUrl')
  table.integer('width')
  table.integer('height')
  table.datetime('created').defaultTo(knex.fn.now())
  table.datetime('updated')

  table.foreign('userId').references('id').inTable(tableNames.USERS)
}

const createCommentsTable = knex => (table) => {
  table.increments('id').primary()
  table.integer('postId').unsigned().notNullable()
  table.integer('userId').unsigned().notNullable()
  table.string('content')
  table.datetime('created').defaultTo(knex.fn.now())

  table.foreign('postId').references('id').inTable(tableNames.POSTS)
  table.foreign('userId').references('id').inTable(tableNames.USERS)
}

const likedUsersTable = (table) => {
  table.increments('id').primary()
  table.integer('userId').unsigned().notNullable()
  table.integer('likedUserId').unsigned().notNullable()

  table.foreign('userId').references('id').inTable(tableNames.USERS)
  table.foreign('likedUserId').references('id').inTable(tableNames.USERS)
}

const createNotificationsTable = knex => (table) => {
  table.increments('id').primary()
  table.integer('userId').unsigned().notNullable()
  table.integer('targetUserId').unsigned().notNullable()
  table.integer('postId').unsigned()
  table.enum('type', ['NEW_COMMENT', 'NEW_FOLLOWER']).notNullable()
  table.datetime('created').defaultTo(knex.fn.now())
  table.boolean('seen').defaultTo(false)

  table.foreign('userId').references('id').inTable(tableNames.USERS)
  table.foreign('targetUserId').references('id').inTable(tableNames.USERS)
  table.foreign('postId').references('id').inTable(tableNames.POSTS)
}

exports.up = knex => knex.schema
  .createTable(tableNames.USERS, createUsersTable(knex))
  .createTable(tableNames.POSTS, createPostsTable(knex))
  .createTable(tableNames.COMMENTS, createCommentsTable(knex))
  .createTable(tableNames.LIKED_USERS, likedUsersTable)
  .createTable(tableNames.NOTIFICATIONS, createNotificationsTable(knex))

exports.down = knex => knex.schema
  .dropTable(tableNames.NOTIFICATIONS)
  .dropTable(tableNames.LIKED_USERS)
  .dropTable(tableNames.COMMENTS)
  .dropTable(tableNames.POSTS)
  .dropTable(tableNames.USERS)
