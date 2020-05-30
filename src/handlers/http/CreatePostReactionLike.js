import uuid from 'uuid'

import { Operation, HTTPResponse } from '../../lib/http/Base'

import Reaction from '../../models/Reaction'

import Thread from '../../models/Thread'
import Post from '../../models/Post'

class CreatePostReactionLike extends Operation {
  static model = Post
  static canBeCalledAnonymously = false

  async extract_params(req) {
    const now = new Date().toISOString()

    console.log(req.body)
    this.args = {
      thread: req.params.thread_id,
      post: req.params.post_id,
      body: {
        reaction: 'like',
        value: (req.body.value === undefined) ? 1 : req.body.value,
        created_at: now,
        id: uuid()
      }
    }
  }

  uuid_to_ltree(uuid_with_dashes) {
    return uuid_with_dashes.replace(/-/g, '_')
  }

  async execute() {
    this.services.logger.info('arguments')
    this.services.logger.info(this.args)

    const post = await Post.query().findById(this.args.post)

    console.log(post)

    const query = Reaction.query().insertAndFetch({
      ...this.args.body,
      path: post.path
    })

    const inserted = await query


    this.services.event_publisher.publish(
      ['ReplyReaction', 'Created'].join(''),
      {
        ...inserted
      },
      this.user
    )

    return HTTPResponse.Created(inserted)
  }
}

export {
  CreatePostReactionLike
}
