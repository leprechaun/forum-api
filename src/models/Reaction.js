import { Model } from 'objection'
import User from './User'

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

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    return {
      actor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reactions.user_id',
          to: 'users.id'
        }
      }
    }
  }
}
