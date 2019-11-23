import { config } from 'db/config'
import * as Knex from 'knex'
import { create } from 'services/logger'

const log = create('db')

const env = process.env.NODE_ENV || 'development'
log(`selected environment: ${env}`)
if (!config.hasOwnProperty(env)) throw new Error(`Could not find database configuration for env: ${env}`)

log.info(config[env])

export const db = Knex(config[env])
