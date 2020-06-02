import Thread from '../../models/Thread'
import ListOperation from '../../lib/http/ListOperation'

class ListThreads extends ListOperation {
  static model = Thread
  static canBeCalledAnonymously = true

  async extract_params(req) {
    this.args = {
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

        query.where('status', 'published')
        query.where('published_at', '<=', new Date().toISOString())

        query.eager('author')
          .modifyEager('author', builder => {
            builder
              .select('id', 'nickname', 'picture')
              .options({ operationId: this.constructor.name, logger: this.services.logger })
          })


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
