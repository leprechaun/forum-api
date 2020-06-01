import { Model } from 'objection'

import Reaction from './Reaction'
import User from './User'

export default class Post extends Model {
  static get tableName() {
    return 'posts'
  }

  static toHttpRepresentation(item) {
    return item
  }

  static insert(post, andFetch = false) {
    if(andFetch) {
      return this.query().insert(post)
    } else {
      return this.query().insertAndFetch(post)
    }
  }

  static get relationMappings() {
    // Importing models here is a one way to avoid require loops.
    return {
      reactions: {
        relation: Model.HasManyRelation,
        modelClass: Reaction,
        join: {
          from: 'posts.path',
          to: 'reactions.path'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'posts.user_id',
          to: 'users.id'
        }
      }
    }
  }
}
