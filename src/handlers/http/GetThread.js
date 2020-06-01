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
        arr[i].author = arr[i].user
        delete arr[i].user

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
    /*
    thread_query.eager('user')
      .modifyEager('user', builder => {
        builder
          .select('id', 'nickname')
          .options({ operationId: this.constructor.name, logger: this.services.logger })
      })
      */

    const thread = await thread_query

    /*
    thread.author = thread.user
    delete thread.user
    delete thread.user_id

    const text = await Post.query()
      .findById(this.args.thread_id)
      */

    const search_path = []

    search_path.push(this.args.thread_id)

    if(this.args.root !== undefined) {
      search_path.push('*')
      search_path.push(this.args.root)
    }

    search_path.push('*{,' + this.args.depth + '}')
    const search_path_string = search_path.join('.').replace(/-/g, '_')

    console.log(search_path_string)

    const post_query = Post.query()
      .where('path', '~', search_path_string)
      .orWhere('id', this.args.thread_id)

    post_query.eager('user')
      .modifyEager('user', builder => {
        builder
          .select('id', 'nickname')
          .options({ operationId: this.constructor.name, logger: this.services.logger })
      })


    let replies = await post_query

    for(let reply of replies) {
      if(reply.id == this.args.thread_id) {
        thread.post = reply
      }
    }

    delete thread.user_id
    thread.author = thread.post.user
    thread.text = thread.post.text

    delete thread.post

    const reactions_query = Reaction.query()
      .where('path', '<@', this.args.thread_id.replace(/-/g, '_') )
      .sum('value')
      .select('reaction', 'path')
      .groupBy('reaction', 'path')

    let reactions = await reactions_query

    let reactions_hash = {}
    for(const reaction of reactions) {
      reactions_hash[reaction.path] = reaction
    }

    replies = replies.map( (reply) => {
      reply.parent = reply.path.split('.').slice(-2, -1)[0] || null
      if( reactions_hash[reply.path]) {
        reply.reactions = {
          'sum': reactions_hash[reply.path].sum,
          reaction: reactions_hash[reply.path].reaction
        }
      } else {
        reply.reactions = {}
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

    thread.replies = thread.replies.map( r => {
      delete r.path
      delete r.parent
      return r
    })

    return HTTPResponse.Okay(thread)
  }
}

export {
  GetThread
}
