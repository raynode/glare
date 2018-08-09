
import config from 'config'
import { create } from 'logger'
import { connect, connection, Connection } from 'mongoose'

const log = create('db', 'mongo')
const mongoConfig = config.mongo

export default () => new Promise<Connection>((resolve, reject) => {

  connection
    .on('error', err => {
      console.log(err)
    })
    .on('close', () => log('Database connection closed.'))
    .once('open', () => {
      log('Connection established for ' + mongoConfig.uri)
      resolve(connection)
    })

  connect(mongoConfig.uri)
})
