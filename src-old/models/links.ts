import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'
import { DATE, DefineModelAttributes, fn, Instance, STRING, TEXT, UUID } from 'sequelize'
import { DataTypes, Node, sequelize, SequelizeAttributes } from 'services/db'

export interface LinksAttributes extends Partial<Node> {
  id?: string
  userId?: string
  datetime?: Date
  title: string
  url: string
  content?: string
  user?: UserInstance
  getUser?: () => UserInstance
  tags?: TagInstance[]
  getTags?: () => TagInstance[]
}

export type LinksInstance = Instance<LinksAttributes> & LinksAttributes

const attributes: DefineModelAttributes<LinksAttributes> = {
  id: {
    allowNull: false,
    defaultValue: fn('gen_random_uuid'),
    primaryKey: true,
    type: UUID,
  },
  userId: { type: UUID, allowNull: true, visible: false },
  url: { type: STRING, allowNull: false, primaryKey: true },
  content: { type: TEXT, allowNull: true },
  datetime: { type: DATE, allowNull: true },
  title: { type: STRING, allowNull: false },
}

export const Link = sequelize.define<LinksInstance, LinksAttributes>('Link', attributes)

Link.associate = ({ User }) => {
  // associations can be defined here
  Link.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'id',
    as: 'user',
  })

  User.hasMany(Link, {
    as: 'bookmarks',
    foreignKey: 'userId',
    sourceKey: 'id',
  })
}
