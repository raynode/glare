import { config } from 'config'

import { each } from 'lodash'
import { Account } from 'models/account'
import { Asset } from 'models/asset'
import { Expense } from 'models/expense'
import { Post } from 'models/post'
import { Tag } from 'models/tag'
import { User } from 'models/user'
import { sequelize } from 'services/db'
import { create } from 'services/logger'

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
log('Running associations')
each(models, model => (model.associate ? model.associate(models) : null))

export const initialized = sequelize.sync({})
