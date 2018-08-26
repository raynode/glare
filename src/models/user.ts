
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'

import { AccountInstance } from 'models/account'
import { ExpenseInstance } from 'models/expense'
import { PostInstance } from 'models/post'
import { TagInstance } from 'models/tag'

export interface UserAttributes extends Partial<Node> {
  givenName: string
  familyName: string
  nickname: string
  name?: string
  picture: string
  gender: string
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
  givenName: { type: DataTypes.STRING, allowNull: true },
  familyName: { type: DataTypes.STRING, allowNull: true },
  nickname: { type: DataTypes.STRING, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  picture: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  locale: { type: DataTypes.STRING, allowNull: true },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      this.setDataValue('email', val.toLowerCase())
    },
  },
  emailVerified: { type: DataTypes.BOOLEAN, allowNull: true },
}

export const User = sequelize.define<UserInstance, UserAttributes>('User', attributes)

User.associate = models => {}
