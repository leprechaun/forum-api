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

    return HTTPResponse.Created(inserted)

    const inserted_post = await Post.query().insertAndFetch({
      id: this.args.body.id,
      text: this.args.body.text,
      path: path.map(this.uuid_to_ltree).join('.'),
      created_at: this.args.body.created_at
    })

    this.services.event_publisher.publish(
      ['Reply', 'Created'].join(''),
      {
        ...inserted_post
      },
      this.user
    )


    return HTTPResponse.Created(inserted_post)
  }
}

export {
  CreatePostReactionLike
}
