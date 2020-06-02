import uuid from 'uuid'

import { Operation, HTTPResponse } from '../../lib/http/Base'

import Thread from '../../models/Thread'

class PublishThread extends Operation {
  static model = Thread
  static canBeCalledAnonymously = false

  async extract_params(req) {
    const now = new Date().toISOString()

    this.args = {
      thread_id: req.params.thread_id
    }
  }

  async execute() {
    this.services.logger.info('arguments')
    this.services.logger.info(this.args)

    const published = await Thread.query().patchAndFetchById(
      this.args.thread_id,
      {
        status: 'published'
      }
    )

    this.services.event_publisher.publish(
      ['Thread', 'Published'].join(''),
      {
        ...published
      },
      this.user
    )

    return HTTPResponse.Created(published)
  }
}

export {
  PublishThread
}
