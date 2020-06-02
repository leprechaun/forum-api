const up = knex => {
  return knex.schema
    .table('reactions', function (table) {
      table.uuid('user_id')
    })
}

const down = (knex, Promise) => {
  return knex.schema
    .table('reactions', function(table) {
      table.dropColumn('user_id')
    })
}

export { up, down }
