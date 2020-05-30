import { Model } from 'objection'

export default class Thread extends Model {
  static get tableName() {
    return 'threads'
  }

  static toHttpRepresentation(item) {
    return item
  }

  static insert(thread, andFetch = false) {
    if(andFetch) {
      return this.query().insert(thread)
    } else {
      return this.query().insertAndFetch(thread)
    }
  }
}
