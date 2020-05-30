import uuid from 'uuid'
import axios from 'axios'

import { Operation, HTTPResponse } from '../../lib/http/Base'

import Thread from '../../models/Thread'
import Post from '../../models/Post'
import Reaction from '../../models/Reaction'

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
    var out = []
    for(var i in arr) {
        if(arr[i].parent == parent) {
            delete arr[i].parent
            delete arr[i].path

            var replies = this.getNestedChildren(arr, arr[i].id.replace(/-/g, '_'))

            if(replies.length) {
                arr[i].replies = replies
            }
            out.push(arr[i])
        }
    }
    return out
  }

  async execute() {
    const thread = await Thread.query().findById(this.args.thread_id)
    const text = await Post.query()
      .findById(this.args.thread_id)

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

    let replies = await post_query

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

    thread.text = text.text
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
