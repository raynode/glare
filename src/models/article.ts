import { DataTypes, Node, Sequelize, SequelizeAttributes, sequelize } from 'services/db'

export interface ArticleAttributes extends Partial<Node> {
  stub: string
  title: string
  AuthorId: string
  image?: string
  published?: boolean
  // content: Widget[]
  // tags: Tag[]
}

export type ArticleInstance = Sequelize.Instance<ArticleAttributes> & ArticleAttributes

const attributes: SequelizeAttributes<ArticleAttributes> = {}

export const Article = sequelize.define<ArticleInstance, ArticleAttributes>('Article', attributes)

Article.associate = models => {
  // associations can be defined here
  Article.belongsTo(models.User, {
    foreignKey: 'AuthorId',
    as: 'author',
  })
}
