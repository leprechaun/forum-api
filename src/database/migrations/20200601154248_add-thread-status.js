const up = async knex => {
  await knex.schema
    .table('threads', function (table) {
      table.string('status')
      table.timestamp('published_at')
    })

  await knex.raw('UPDATE threads set status=\'published\'')

  return await knex.schema
    .alterTable('threads', function(table) {
      table.string('status').notNullable().alter()
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .table('threads', function(table) {
      table.dropColumn('status')
      table.dropColumn('published_at')
    })
}

export { up, down }
