
import { connect, connection  } from 'mongoose'

import { create } from 'logger'

const log = create('db', 'mongo')

interface MongoProps {
  uri: string
}

export default (config: MongoProps) => new Promise((resolve, reject) => {

  connection
    .on('error', reject)
    .on('close', () => log('Database connection closed.'))
    .once('open', () => {
      log('Connection established for ' + config.uri)
      resolve(connection)
    })

  connect(config.uri)
})
