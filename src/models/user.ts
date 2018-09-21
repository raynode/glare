
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'

import { AccountInstance } from 'models/account'
import { ExpenseInstance } from 'models/expense'
import { PostInstance } from 'models/post'
import { TagInstance } from 'models/tag'

export interface UserAttributes extends Partial<Node> {
  id: string
  givenName: string
  familyName: string
  nickname: string
  name?: string
  picture: string
  gender: string
  state: 'admin' | 'member' | 'guest' // admin, verified, unverified
  locale: string
  email: string
  emailVerified: boolean
  accounts?: AccountInstance[]
  getAccounts?: () => AccountInstance[]
  expenses?: ExpenseInstance[]
  getExpenses?: () => ExpenseInstance[]
  posts?: PostInstance[]
  getPosts?: () => PostInstance[]
  tags?: TagInstance[]
  getTags?: () => TagInstance[]
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes

const attributes: SequelizeAttributes<UserAttributes> = {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    allowUpdates: false,
    primaryKey: true,
    unique: true,
    comment: 'Id of the user',
    defaultValue: Sequelize.fn('gen_random_uuid'),
  },
  state: {
    type: Sequelize.ENUM('admin', 'member', 'guest'),
    defaultValue: 'guest',
    allowUpdates: false,
  },
  givenName: { type: Sequelize.STRING, allowNull: true },
  familyName: { type: Sequelize.STRING, allowNull: true },
  nickname: { type: Sequelize.STRING, allowNull: true },
  name: { type: Sequelize.STRING, allowNull: false },
  picture: { type: Sequelize.STRING, allowNull: true },
  gender: { type: Sequelize.STRING, allowNull: true },
  locale: { type: Sequelize.STRING, allowNull: true },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      this.setDataValue('email', val.toLowerCase())
    },
  },
  emailVerified: { type: Sequelize.BOOLEAN, allowNull: true },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}

export const User = sequelize.define<UserInstance, UserAttributes>('User', attributes)

export const Actions = {
  findAll: () => User.findAll(),
  findById: (id: string) => User.findById(id),
  findByEmail: (email: string) => User.findOne({ where: { email }}),
}

User.associate = models => { /**/ }
