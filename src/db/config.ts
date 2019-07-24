import { join } from 'path'

const BASE_PATH = __dirname

const base = {
  client: 'pg',
  // connection: 'postgres://USER:PASSWD@localhost:port/DB-NAME',
  migrations: {
    directory: join(BASE_PATH, 'migrations'),
  },
  seeds: {
    directory: join(BASE_PATH, 'seeds'),
  },
}

export const config = {
  development: {
    ...base,
    connection: 'postgres://nox@localhost:5432/glare_dev',
  },
  test: {
    ...base,
    connection: 'postgres://nox@localhost:5432/glare_test',
    // tslint:disable-next-line
    // connection: `postgres://${process.env.CI_DB_USERNAME}:${process.env.CI_DB_PASSWORD}localhost:5432/${process.env.CI_DB_NAME}`,
  },
  production: {
    ...base,
    // tslint:disable-next-line
    connection: `postgres://${process.env.PROD_DB_USERNAME}:${process.env.PROD_DB_PASSWORD}@localhost:5432/${process.env.PROD_DB_NAME}`,
  },
}

export default config
