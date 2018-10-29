import { config } from 'config'

import { Account } from 'models/account'
import { Asset } from 'models/asset'
import { Expense } from 'models/expense'
import { Post } from 'models/post'
import { Tag } from 'models/tag'
import { User } from 'models/user'
import { sequelize } from 'services/db'
import { create } from 'services/logger'
import { each } from 'lodash'
const log = create('models')

export const models = {
  Account,
  Asset,
  Expense,
  Post,
  Tag,
  User,
}

// associate all models
each(models, model => model.associate ? model.associate(models) : null)

export const initialized = sequelize.sync({})
