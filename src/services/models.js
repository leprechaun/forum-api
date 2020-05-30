import { Model } from 'objection'

import Thread from '../models/Thread'
import Post from '../models/Post'

import connection from '../database/knex'

Model.knex(connection)


export { Thread, Post }
