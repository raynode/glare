
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'

import { TagInstance } from 'models/tag'
import { ExpenseInstance } from 'models/expense'
import { UserInstance } from 'models/user'

export interface AccountAttributes extends Partial<Node> {
  amount: number
  expenses?: ExpenseInstance[]
  owners?: UserInstance[]
  tags?: TagInstance[]
}

export type AccountInstance = Sequelize.Instance<AccountAttributes> & AccountAttributes

const attributes: SequelizeAttributes<AccountAttributes> = {
  amount: { type: DataTypes.DECIMAL, allowNull: false },
}

export const Account = sequelize.define<AccountInstance, AccountAttributes>('Account', attributes)

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
