import { AccountInstance } from 'models/account'
import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'
import { DataTypes, Node, Sequelize, sequelize, SequelizeAttributes } from 'services/db'

export interface ExpenseAttributes extends Partial<Node> {
  id: string
  userId: string
  accountId: string
  amount: number
  user?: UserInstance
  getUser?: () => UserInstance
  account?: AccountInstance
  getAccount?: () => AccountInstance
  tags?: TagInstance[]
  getTags?: () => TagInstance[]
}

export type ExpenseInstance = Sequelize.Instance<ExpenseAttributes> & ExpenseAttributes

const attributes: SequelizeAttributes<ExpenseAttributes> = {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    allowUpdates: false,
    primaryKey: true,
    unique: true,
    comment: 'Id of the user',
    defaultValue: Sequelize.fn('gen_random_uuid'),
  },
  amount: { type: Sequelize.DECIMAL, allowNull: false },
  accountId: { type: Sequelize.UUID, allowNull: false, visible: false },
  userId: { type: Sequelize.UUID, allowNull: false, visible: false },
}

export const Expense = sequelize.define<ExpenseInstance, ExpenseAttributes>('Expense', attributes)

export const Actions = {
  findByAccount: (account: AccountInstance) => account.getExpenses(),
  findByUser: async (user: UserInstance) => user.getExpenses(),
}

Expense.associate = models => {
  // associations can be defined here
  Expense.belongsTo(models.User, {
    as: 'user',
    foreignKey: 'userId',
  })

  models.User.hasMany(Expense, {
    as: 'expenses',
    foreignKey: 'userId',
    sourceKey: 'id',
  })

  Expense.belongsTo(models.Account, {
    as: 'account',
    foreignKey: 'accountId',
  })

  models.Account.hasMany(Expense, {
    as: 'expenses',
    foreignKey: 'accountId',
    sourceKey: 'id',
  })
}
