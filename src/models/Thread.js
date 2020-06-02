import { Model } from 'objection'

import User from './User'

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

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'threads.user_id',
          to: 'users.id'
        }
      }
    }
  }

}
