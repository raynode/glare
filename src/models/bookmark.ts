
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'

import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'
export interface ArticleAttributes extends Partial<Node> {
  name: string
  url: string
  userId: string
  user?: UserInstance
  getUser?: () => UserInstance
  tags?: TagInstance[]
  getTags?: () => TagInstance[]
}

export type ArticleInstance = Sequelize.Instance<ArticleAttributes> & ArticleAttributes

const attributes: SequelizeAttributes<ArticleAttributes> = {
  name: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
}

export const Bookmark = sequelize.define<ArticleInstance, ArticleAttributes>('Bookmark', attributes)

Bookmark.associate = models => {
  // associations can be defined here
  Bookmark.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  })

  models.User.hasMany(Bookmark, {
    as: 'bookmarks',
    foreignKey: 'id',
    sourceKey: 'id',
  })
}
