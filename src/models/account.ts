import { ExpenseInstance } from 'models/expense'
import { TagInstance } from 'models/tag'
import { User, UserInstance } from 'models/user'
import { DataTypes, Node, Sequelize, sequelize, SequelizeAttributes } from 'services/db'

export interface AccountAttributes extends Partial<Node> {
  id: string
  amount: number
  expenses?: ExpenseInstance[]
  getExpenses?: () => ExpenseInstance[]
  owners?: UserInstance[]
  getOwners?: () => UserInstance[]
  tags?: TagInstance[]
  getTags?: () => TagInstance[]
}

export type AccountInstance = Sequelize.Instance<AccountAttributes> & AccountAttributes

const attributes: SequelizeAttributes<AccountAttributes> = {
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
}

export const Account = sequelize.define<AccountInstance, AccountAttributes>('Account', attributes)

export const Actions = {
  findByUser: async (user: UserInstance) => user.getAccounts(),
}

Account.associate = models => {
  // associations can be defined here
  Account.belongsToMany(models.User, {
    as: 'owners',
    through: 'account_owners',
    foreignKey: 'accountId',
  })

  models.User.belongsToMany(Account, {
    as: 'accounts',
    through: 'account_owners',
    foreignKey: 'userId',
  })
}
