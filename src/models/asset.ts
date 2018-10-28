
import { config } from 'config'

import {
  DataTypes,
  Instance,
  Node,
  sequelize,
  Sequelize,
  SequelizeAttributes,
} from 'services/db'

export interface AssetAttributes extends Partial<Node> {
  id: string
  name: string
  type: string
  mimetype: string
  data?: any
  url?: string
}

export type AssetInstance = Instance<AssetAttributes> & AssetAttributes

const attributes: SequelizeAttributes<AssetAttributes> = {
  id: {
    allowNull: false,
    defaultValue: Sequelize.fn('gen_random_uuid'),
    primaryKey: true,
    type: Sequelize.UUID,
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  type: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  mimetype: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  data: {
    allowNull: false,
    visible: false,
    type: Sequelize.BLOB('long'),
  },
  url: {
    type: Sequelize.VIRTUAL,
    get(...args) { return `${config.host}/asset/${this.get('id')}` },
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
export const Asset = sequelize.define<AssetInstance, AssetAttributes>('Asset', attributes)

Asset.associate = models => {
  // associations can be defined here
}
