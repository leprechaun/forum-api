import { Operation, HTTPResponse } from '../../lib/http/Base'

import Thread from '../../models/Thread'
import Post from '../../models/Post'
import Reaction from '../../models/Reaction'
import User from '../../models/Reaction'

class GetThread extends Operation {
  static model = Thread
  static canBeCalledAnonymously = false

  async extract_params(req) {
    const now = new Date().toISOString()
    this.args = {
      ...req.params,
      ...req.query
    }
  }

  getNestedChildren(arr, parent) {
    const out = []
    for(let i in arr) {
      if(arr[i].parent == parent) {
        delete arr[i].parent
        delete arr[i].path
        delete arr[i].user_id

        let replies = this.getNestedChildren(arr, arr[i].id.replace(/-/g, '_'))

        if(replies.length) {
          arr[i].replies = replies
        }
        out.push(arr[i])
      }
    }
    return out
  }

  async execute() {
    const thread_query = Thread.query().findById(this.args.thread_id)

    const thread = await thread_query

    const search_path = []

    search_path.push(this.args.thread_id)

    if(this.args.root !== undefined) {
      search_path.push('*')
      search_path.push(this.args.root)
    }

    search_path.push('*{,' + this.args.depth + '}')
    const search_path_string = search_path.join('.').replace(/-/g, '_')

    const post_query = Post.query()
      .where('path', '~', search_path_string)
      .orWhere('id', this.args.thread_id)

    post_query.eager('author')
      .modifyEager('author', builder => {
        builder
          .select('id', 'nickname', 'picture')
          .options({ operationId: this.constructor.name, logger: this.services.logger })
      })

    let replies = await post_query

    const root = replies.filter((r) => {
      return [this.args.thread_id, this.args.root].includes(r.id)
    })[0]

    thread.author = root.author
    thread.text = root.text

    delete thread.user_id

    const reactions_query = Reaction.query()
      .where('path', '<@', this.args.thread_id.replace(/-/g, '_') )
      .select('reaction', 'path', 'value')
    reactions_query.eager('actor')
      .modifyEager('actor', builder => {
        builder
          .select('id', 'nickname', 'picture')
          .options({ operationId: this.constructor.name, logger: this.services.logger })
      })

    let reactions = await reactions_query

    let reactions_hash = {}
    for(const reaction of reactions) {
      if(! Object.keys(reactions_hash).includes(reaction.path)) {
        reactions_hash[reaction.path] = []
      }

      reactions_hash[reaction.path].push(reaction)
    }


    replies = replies.map( (reply) => {
      reply.parent = reply.path.split('.').slice(-2, -1)[0] || null
      reply.reactions = []
      if( reactions_hash[reply.path]) {
        reply.reactions = reactions_hash[reply.path].map( reaction => {
          delete reaction.path
          return reaction
        })
      }

      return reply
    }).filter( (r) => {
      if(this.args.root) {
        return r.id !== this.args.root
      } else {
        return r.id !== thread.id
      }
    })


    const start = new Date()
    if(this.args.root) {
      thread.replies = this.getNestedChildren(replies, this.args.root.replace(/-/g, '_'))
    } else {
      thread.replies = this.getNestedChildren(replies, thread.id.replace(/-/g, '_'))
    }


    return HTTPResponse.Okay(thread)
  }
}

export {
  GetThread
}
