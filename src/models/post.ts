
import { DataTypes, Node, sequelize, Instance, Sequelize, SequelizeAttributes } from 'services/db'

import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'

export interface PostAttributes extends Partial<Node> {
  stub: string
  title: string
  userId: string
  image?: string
  published?: boolean
  author?: UserInstance
  tags?: TagInstance[]
}

export type PostInstance = Instance<PostAttributes> & PostAttributes

const attributes: SequelizeAttributes<PostAttributes> = {
  stub: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}
export const Post = sequelize.define<PostInstance, PostAttributes>('Post', attributes)

Post.associate = models => {
  // associations can be defined here
  Post.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'author',
  })

  models.User.hasMany(Post, {
    as: 'posts',
    foreignKey: 'userId',
    sourceKey: 'id',
  })
}
