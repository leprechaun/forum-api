import { Model } from 'objection'

export default class Reaction extends Model {
  static get tableName() {
    return 'reactions'
  }

  static toHttpRepresentation(item) {
    return item
  }

  static insert(reaction, andFetch = false) {
    if(andFetch) {
      return this.query().insert(reaction)
    } else {
      return this.query().insertAndFetch(reaction)
    }
  }
}
