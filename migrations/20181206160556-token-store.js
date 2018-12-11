'use strict'

const uuid = require('uuid/v4')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tokens', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      accessToken: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      refreshToken: {
        type: Sequelize.TEXT,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
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
    })

    await queryInterface.sequelize.query(`
      CREATE TRIGGER updateUsersUpdatedAt
        BEFORE UPDATE ON "public"."Tokens"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tokens')
  },
}
