
import * as Sequelize from 'sequelize'
// export {
//   Model,
//   Models,
//   Instance,
// } from 'sequelize'
export type Model<TInstance, TAttribute> = Sequelize.Model<TInstance, TAttribute>
export type Models = Sequelize.Models
export type Instance<TAttribute> = Sequelize.Instance<TAttribute>
// tslint:disable-next-line
import { DataTypeAbstract, DefineAttributeColumnOptions } from 'sequelize'

import { create } from 'services/logger'
const log = create('db')

const env = process.env.NODE_ENV || 'development'
import { config as Config } from 'config'
const config = Config.sequelize[env]

const createSequelize = (config: any) => {
  if (config.use_env_variable) {
    log(`creating from env: ${process.env[config.use_env_variable]}`)
    return new Sequelize(process.env[config.use_env_variable], config)
  } else {
    log(`creating from config`)
    return new Sequelize(config.database, config.username, config.password, config)
  }
}

export interface Node {
  id: string
  createdAt: Date
  updatedAt: Date
}

export type SequelizeAttributes<Attributes extends { [key: string]: any }> = {
  [Key in keyof Attributes]: string | DataTypeAbstract | DefineAttributeColumnOptions
}

export const sequelize = createSequelize(config)
export const DataTypes = Sequelize
export { Sequelize }
