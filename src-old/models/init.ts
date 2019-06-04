import { each } from 'lodash'

import { config } from 'config'
import { Account } from 'models/account'
import { Asset } from 'models/asset'
import { Expense } from 'models/expense'
import { Link } from 'models/links'
import { Post } from 'models/post'
import { Tag } from 'models/tag'
import { Token } from 'models/token'
import { User } from 'models/user'
import { sequelize } from 'services/db'
import { create } from 'services/logger'

const log = create('models')

export const models = {
  Account,
  Asset,
  Expense,
  Link,
  Post,
  Tag,
  Token,
  User,
}

// associate all models
log('Running associations')
each(models, model => (model.associate ? model.associate(models) : null))

export const initialized = sequelize.sync({})
