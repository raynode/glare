import { config } from 'config'
import { sequelize } from 'services/db'
import { create } from 'services/logger'
const log = create('models')

import { Account } from 'models/account'
import { Asset } from 'models/asset'
import { Expense } from 'models/expense'
import { Post } from 'models/post'
import { Tag } from 'models/tag'
import { User } from 'models/user'

export const models = {
  Account,
  Asset,
  Expense,
  Post,
  Tag,
  User,
}

const associate = (modelName: string) => {
  if (models[modelName].associate) models[modelName].associate(models)
}

Object.keys(models).forEach(associate)

export const initialized = sequelize.sync({})
