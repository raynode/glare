
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'

import { AccountInstance } from 'models/account'
import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'

export interface ExpenseAttributes extends Partial<Node> {
  userId: string
  accountId: string
  amount: number
  user?: UserInstance
  account?: AccountInstance
  tags?: TagInstance[]
}

export type ExpenseInstance = Sequelize.Instance<ExpenseAttributes> & ExpenseAttributes

const attributes: SequelizeAttributes<ExpenseAttributes> = {
  amount: { type: DataTypes.DECIMAL, allowNull: false },
  accountId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}

export const Expense = sequelize.define<ExpenseInstance, ExpenseAttributes>('Expense', attributes)

Expense.associate = models => {
  // associations can be defined here
  Expense.belongsTo(models.User, {
    foreignKey: 'id',
    as: 'user',
  })

  models.User.hasMany(Expense, {
    as: 'expenses',
    foreignKey: 'userId',
    sourceKey: 'id',
  })

  Expense.belongsTo(models.Account, {
    foreignKey: 'id',
    as: 'account',
  })

  models.Account.hasMany(Expense, {
    as: 'expenses',
    foreignKey: 'accountId',
    sourceKey: 'id',
  })
}
