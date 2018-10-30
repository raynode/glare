'use strict'

const uuid = require('uuid/v4')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stub: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      imageId: {
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      userId: {
        type: Sequelize.UUID,
        // this should not be allowed, but is as the user itself might be deleted
        // allowNull : false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    })

    await queryInterface.sequelize.query(`
      CREATE TRIGGER updateUpdatedAt BEFORE UPDATE
        ON "public"."Posts" FOR EACH ROW EXECUTE PROCEDURE
          updateUpdatedAt()
    `)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Posts')
  },
}
