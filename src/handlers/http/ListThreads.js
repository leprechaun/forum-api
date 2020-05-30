import Thread from '../../models/Thread'
import ListOperation from '../../lib/http/ListOperation'

class ListThreads extends ListOperation {
  static model = Thread
  static canBeCalledAnonymously = true

  async extract_params(req) {
    this.args = {
      include_deleted: req.query.include_deleted,
      include_meta: req.query.include_meta,
      limit: req.query.limit,
      offset: req.query.offset,
      order: this.constructor.model.order || ['created_at', 'desc'],
    }
  }


  toHttpRepresentation = Thread.toHttpRepresentation

  resources() {
    return {
      resources: (() => {
        let query = this.constructor.model.query()

        query.options({ 'operationId': this.constructor.name })
        if (this.constructor.model.hasDeletion && !this.args.include_deleted) {
          query.where({ '_deleted_at': null })
        }

        if(this.args.categories) {
          query.whereRaw('categories ~ \'*.' + this.args.categories + '.*\'')
        }

        query.skipUndefined()
        query.offset(this.args.offset)
        query.limit(this.args.limit)
        query.orderBy(this.args.order[0], this.args.order[1])

        return query
      })()
    }
  }
}

export {
  ListThreads
}
