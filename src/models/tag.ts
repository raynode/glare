
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'
import { create } from 'services/logger'

const log = create('models/tag')

export interface TagAttributes extends Partial<Node> {
  tag: string
}

export interface TagLinkAttributes extends Partial<Node> {
  table: string
  foreign_key: string
}

export type TagInstance = Sequelize.Instance<TagAttributes> & TagAttributes
export type TagLinkInstance = Sequelize.Instance<TagAttributes> & TagAttributes

const tagAttributes: SequelizeAttributes<TagAttributes> = {
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
}

const tagLinkAttributes: SequelizeAttributes<TagLinkAttributes> = {
  table: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  foreign_key: {
    type: Sequelize.UUID,
    allowNull: false,
  },
}

export const Tag = sequelize.define<TagInstance, TagAttributes>('Tag', tagAttributes, {
  timestamps: false,
})
export const TagLink = sequelize.define<TagLinkInstance, TagLinkAttributes>('TagLink', tagLinkAttributes, {
  tableName: 'Tag_Link',
})

Tag.associate = models => {
  // associations can be defined here
  log('Adding tags to:', Object.keys(models))
  Object.keys(models).forEach(model => {
    if(model === 'Tag' || model === 'Tag_Link')
      return

    log('working on model:', model)
    const Model = models[model]

    Model.belongsToMany(Tag, {
      foreignKey: 'foreign_key',
      constraints: false,
      through: {
        model: TagLink,
        unique: false,
        scope: {
          table: Model.name,
        },
      },
    })

    Tag.belongsToMany(Model, {
      foreignKey: 'tag',
      through: {
        model: TagLink,
        unique: false,
      },
    })
  })
}
