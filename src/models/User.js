import { Model } from 'objection'

export default class User extends Model {
  static get tableName() {
    return 'users'
  }

  static toHttpRepresentation(item) {
    return item
  }

  static insert(user, andFetch = false) {
    if(andFetch) {
      return this.query().insert(user)
    } else {
      return this.query().insertAndFetch(user)
    }
  }
}
