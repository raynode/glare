import { config } from 'config'

import { DataTypes, Instance, Node, Sequelize, sequelize, SequelizeAttributes } from 'services/db'

export interface TokenAttributes extends Partial<Node> {
  id?: string
  accessToken: string
  refreshToken: string
  type: string
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

export type TokenInstance = Instance<TokenAttributes> & TokenAttributes

const attributes: SequelizeAttributes<TokenAttributes> = {
  id: {
    allowNull: false,
    defaultValue: Sequelize.fn('gen_random_uuid'),
    primaryKey: true,
    type: Sequelize.UUID,
  },
  accessToken: {
    allowNull: false,
    type: Sequelize.TEXT,
  },
  refreshToken: {
    type: Sequelize.TEXT,
  },
  type: {
    allowNull: false,
    type: Sequelize.TEXT,
  },
  userId: {
    allowNull: false,
    type: Sequelize.STRING,
    visible: false,
  },
  createdAt: {
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    type: Sequelize.DATE,
  },
}
export const Token = sequelize.define<TokenInstance, TokenAttributes>('Token', attributes)

Token.associate = ({ User }) => {
  Token.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User',
  })

  User.hasMany(Token, {
    as: 'tokens',
    foreignKey: 'userId',
    sourceKey: 'id',
  })
}
