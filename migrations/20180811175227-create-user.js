'use strict'

const uuid = require('uuid/v4')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      givenName: {
        type: Sequelize.STRING,
      },
      familyName: {
        type: Sequelize.STRING,
      },
      nickname: {
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      picture: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.STRING,
      },
      locale: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.ENUM('admin', 'member', 'guest'),
        defaultValue: 'guest',
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
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
        BEFORE UPDATE ON "public"."Users"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE "public"."Users"
        ADD CONSTRAINT users_email_need_to_be_lowercase
          CHECK (email = lower(email));
    `)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  },
}
