
import config from 'config'
import { connect, connection, Connection } from 'mongoose'
import { create } from 'services/logger'

const log = create('db', 'mongo')
const mongoConfig = config.mongo

export default () => new Promise<Connection>((resolve, reject) => {

  connection
    .on('error', err => {
      log.error(err)
    })
    .on('close', () => log('Database connection closed.'))
    .once('open', () => {
      log('Connection established for ' + mongoConfig.uri)
      resolve(connection)
    })
  log(mongoConfig.uri)
  connect(mongoConfig.uri)
})
