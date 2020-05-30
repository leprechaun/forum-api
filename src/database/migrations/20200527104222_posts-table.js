const up = knex => {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS ltree')
    .createTable('posts', function (table) {
      table.uuid('id').primary()
      table.specificType('path', 'ltree')
      table.timestamp('created_at').notNullable()
      table.string('text')
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .dropTable('posts')
}

export { up, down }
