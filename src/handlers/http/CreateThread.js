import uuid from 'uuid'

import { Operation, HTTPResponse } from '../../lib/http/Base'

import Thread from '../../models/Thread'
import Post from '../../models/Post'
import User from '../../models/User'

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

    let cached_user = await User.query().where({sub: this.user.sub})
    console.log(cached_user)

    if(cached_user.length == 0) {
      const userinfo = await this.userinfo()
      console.log(userinfo)

      cached_user = await User.query().insertAndFetch({
        id: uuid(),
        sub: userinfo.sub,
        name: userinfo.name,
        nickname: userinfo.nickname,
        picture: userinfo.picture,
        created_at: new Date(),
        updated_at: userinfo.updated_at
      })
    } else {
      cached_user = cached_user[0]
    }

    console.log(cached_user)

    const inserted_thread = await Thread.insert({
      ...this.args.body,
      user_id: cached_user.id
    })

    const inserted_post = await Post.insert({
      id: this.args.body.id,
      path: this.args.body.id.toString().replace(/-/g, '_'),
      created_at: this.args.body.created_at,
      user_id: cached_user.id,
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
