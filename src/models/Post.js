import { Model } from 'objection'

import Reaction from './Reaction'

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
      }
    }
  }

}
