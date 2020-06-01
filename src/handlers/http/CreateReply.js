import uuid from 'uuid'

import { Operation, HTTPResponse } from '../../lib/http/Base'

import Thread from '../../models/Thread'
import Post from '../../models/Post'
import User from '../../models/User'

class CreateReply extends Operation {
  static model = Post
  static canBeCalledAnonymously = false

  async extract_params(req) {
    const now = new Date().toISOString()
    this.args = {
      ...req.query,
      ...req.params,
      body: {
        ...req.body,
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



    let cached_user = await User.query().where({ sub: this.user.sub })
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

    const thread = await Thread.query().findById(this.args.thread_id)

    let path = []


    let in_response_to_post
    if(typeof(this.args.in_response_to) == 'string') {
      in_response_to_post = await Post.query().findById(this.args.in_response_to)

      path = in_response_to_post.path.split('.')
    } else {
      path.push(this.args.thread_id)
    }

    path.push(this.args.body.id)

    const inserted_post = await Post.query().insertAndFetch({
      id: this.args.body.id,
      text: this.args.body.text,
      path: path.map(this.uuid_to_ltree).join('.'),
      user_id: cached_user.id,
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
  CreateReply
}
