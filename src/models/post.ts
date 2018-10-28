
import {
  DataTypes,
  Instance,
  Node,
  sequelize,
  Sequelize,
  SequelizeAttributes,
} from 'services/db'

import { TagInstance } from 'models/tag'
import { UserInstance } from 'models/user'

export interface PostAttributes extends Partial<Node> {
  id: string
  stub: string
  title: string
  userId: string
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
  image: { type: Sequelize.STRING, allowNull: false },
  published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  userId: { type: Sequelize.UUID, allowNull: false, visible: false },
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
