import uuid from 'uuid'

import { Operation, HTTPResponse } from '../../lib/http/Base'

import Thread from '../../models/Thread'
import Post from '../../models/Post'

class CreateThread extends Operation {
  static model = Thread
  static canBeCalledAnonymously = false

  async extract_params(req) {
    const now = new Date().toISOString()
    this.args = {
      text: req.body.text,
      body: {
        ...req.body,
        created_at: now,
        id: uuid()
      }
    }

    delete this.args.body.text
  }

  async execute() {
    this.services.logger.info(this.args.body)


    const inserted_thread = await Thread.insert(this.args.body)

    const inserted_post = await Post.insert({
      id: this.args.body.id,
      path: this.args.body.id.toString().replace(/-/g, '_'),
      created_at: this.args.body.created_at,
      text: this.args.text
    })

    inserted_thread.text = this.args.text

    this.services.event_publisher.publish(
      ['Thread', 'Created'].join(''),
      {
        ...inserted_thread
      },
      this.user
    )

    return HTTPResponse.Created(inserted_thread)
  }

}

export {
  CreateThread
}
