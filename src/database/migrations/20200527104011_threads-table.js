const up = knex => {
  return knex.schema
    .createTable('threads', function (table) {
      table.uuid('id').primary()
      table.string('title').notNullable()
      table.timestamp('created_at').notNullable()
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .dropTable('threads')
}

export { up, down }
