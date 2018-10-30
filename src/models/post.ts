import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'
import { DataTypes, Instance, Node, Sequelize, sequelize, SequelizeAttributes } from 'services/db'

export interface PostAttributes extends Partial<Node> {
  id: string
  stub: string
  title: string
  userId: string
  imageId: string
  image?: string
  published: boolean
  author?: UserInstance
  getAuthor?: () => UserInstance
  tags?: TagInstance[]
  getTags?: () => TagInstance[]
}

export type PostInstance = Instance<PostAttributes> & PostAttributes

const attributes: SequelizeAttributes<PostAttributes> = {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true,
    unique: true,
    comment: 'Id of the user',
    defaultValue: Sequelize.fn('gen_random_uuid'),
  },
  stub: { type: Sequelize.STRING, allowNull: false },
  title: { type: Sequelize.STRING, allowNull: false },
  imageId: { type: Sequelize.UUID, visible: false },
  published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  userId: { type: Sequelize.UUID, allowNull: false, visible: false },
}
export const Post = sequelize.define<PostInstance, PostAttributes>('Post', attributes)

Post.associate = models => {
  // associations can be defined here
  Post.belongsTo(models.User, {
    as: 'author',
    foreignKey: 'userId',
  })

  Post.belongsTo(models.Asset, {
    as: 'image',
    foreignKey: 'imageId',
  })

  models.User.hasMany(Post, {
    as: 'posts',
    foreignKey: 'userId',
    sourceKey: 'id',
  })
}
