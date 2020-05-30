const up = knex => {
  return knex.schema
    .createTable('reactions', function (table) {
      table.uuid('id').primary()
      table.specificType('path', 'ltree')
      table.timestamp('created_at').notNullable()
      table.string('reaction', 32)
      table.integer('value')
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .dropTable('reactions')
}

export { up, down }
