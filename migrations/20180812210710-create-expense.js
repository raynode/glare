'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Expenses', {
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
      accountId: {
        allowNull: false,
        defaultValue: null,
        type: Sequelize.UUID,
      },
      userId: {
        allowNull: false,
        defaultValue: null,
        type: Sequelize.UUID,
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
    })

    await queryInterface.sequelize.query(`
      CREATE TRIGGER updateUpdatedAt BEFORE UPDATE
        ON "public"."Expenses" FOR EACH ROW EXECUTE PROCEDURE
          updateUpdatedAt()
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Expenses')
  }
};
