import { config } from 'db/config'
import * as Knex from 'knex'

const env = process.env.NODE_ENV || 'development'
if (!config.hasOwnProperty(env)) throw new Error(`Could not find database configuration for env: ${env}`)

console.log(config[env])

export const db = Knex(config[env])
