
import config from 'config'
import { create } from 'logger'
import { connect, connection  } from 'mongoose'

const log = create('db', 'mongo')
const mongoConfig = config.mongo

export default () => new Promise((resolve, reject) => {

  connection
    .on('error', reject)
    .on('close', () => log('Database connection closed.'))
    .once('open', () => {
      log('Connection established for ' + mongoConfig.uri)
      resolve(connection)
    })

  connect(mongoConfig.uri)
})
