const up = knex => {
  return knex.schema
    .table('threads', function (table) {
      table.uuid('user_id')
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .table('threads', function(table) {
      table.dropColumn('user_id')
    })
}

export { up, down }
