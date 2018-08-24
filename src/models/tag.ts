
import { DataTypes, Node, sequelize, Sequelize, SequelizeAttributes } from 'services/db'
import { create } from 'services/logger'

const log = create('models/tag')

export interface TagAttributes extends Partial<Node> {
  id: string
  normalized: string
  tag: string
  TagLinks?: TagLinkInstance[]
}

export interface TagLinkAttributes extends Partial<Node> {
  table: string
  foreign_key: string
  Tag?: TagInstance
}

export type TagInstance = Sequelize.Instance<TagAttributes> & TagAttributes
export type TagLinkInstance = Sequelize.Instance<TagLinkAttributes> & TagLinkAttributes

const tagAttributes: SequelizeAttributes<TagAttributes> = {
  id: {
    allowNull: false,
    defaultValue: Sequelize.fn('gen_random_uuid'),
    primaryKey: true,
    type: Sequelize.UUID,
  },
  normalized: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
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
  timestamps: false,
})

Tag.associate = models => {
  // associations can be defined here
  log('Adding tags to:', Object.keys(models))

  TagLink.belongsTo(Tag, {
    foreignKey: 'id',
  })

  Tag.hasMany(TagLink, {
    foreignKey: 'id',
  })

  Object.keys(models).forEach(model => {
    if(model === 'Tag' || model === 'Tag_Link')
      return

    log(`Adding tags to ${model}`)
    const Model = models[model]

    Model.belongsToMany(Tag, {
      as: 'tags',
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
      foreignKey: 'id',
      through: {
        model: TagLink,
        unique: false,
      },
    })
  })
}
