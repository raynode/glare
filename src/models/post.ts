
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'

import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'

export interface PostAttributes extends Partial<Node> {
  stub: string
  title: string
  AuthorId: string
  image?: string
  published?: boolean
  author?: UserInstance
  tags?: TagInstance[]
}

export type PostInstance = Sequelize.Instance<PostAttributes> & PostAttributes

const attributes: SequelizeAttributes<PostAttributes> = {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  stub: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING },
  published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  AuthorId: { type: DataTypes.UUID, allowNull: false },
}
export const Post = sequelize.define<PostInstance, PostAttributes>('Post', attributes)

Post.associate = models => {
  // associations can be defined here
  Post.belongsTo(models.User, {
    foreignKey: 'AuthorId',
    as: 'author',
  })

  models.User.hasMany(Post, {
    as: 'posts',
    foreignKey: 'AuthorId',
    sourceKey: 'id',
  })
}
