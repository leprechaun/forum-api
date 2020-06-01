const up = knex => {
  return knex.schema
    .createTable('users', function (table) {
      table.uuid('id').primary()
      table.string('sub').notNullable()
      table.string('name')
      table.string('nickname')
      table.string('picture')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.index(['sub'])
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .dropTable('users')
}

export { up, down }
