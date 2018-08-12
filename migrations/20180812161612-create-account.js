'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      amount: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.DECIMAL,
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
      CREATE TRIGGER updateUpdatedAt BEFORE UPDATE
        ON "public"."Accounts" FOR EACH ROW EXECUTE PROCEDURE
          updateUpdatedAt()
    `)

    await queryInterface.createTable('account_owners', {
      accountId: {
        allowNull: false,
        primaryKey: 'account_owners_pk',
        unique: 'account_owners_pk',
        type: Sequelize.UUID,
      },
      userId: {
        allowNull: false,
        primaryKey: 'account_owners_pk',
        unique: 'account_owners_pk',
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
    })

    await queryInterface.sequelize.query(`
      CREATE TRIGGER updateUpdatedAt BEFORE UPDATE
        ON "public"."account_owners" FOR EACH ROW EXECUTE PROCEDURE
          updateUpdatedAt()
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Accounts')
    await queryInterface.dropTable('account_owners')
  }
};
