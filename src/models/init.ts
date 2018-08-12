
import { sequelize } from 'services/db'

import { Account } from 'models/account'
import { Expense } from 'models/expense'
import { Post } from 'models/post'
import { Tag } from 'models/tag'
import { User } from 'models/user'

export const models = {
  Account,
  Expense,
  Post,
  Tag,
  User,
}

const associate = (modelName: string) => {
  console.log('------- assoc' + modelName)
  if (models[modelName].associate)
    models[modelName].associate(models)
}

Object.keys(models).forEach(associate)

export const initialized = sequelize.sync()
