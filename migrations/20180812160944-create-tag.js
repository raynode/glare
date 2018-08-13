'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tags', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      normalized: {
        allowNull: false,
        defaultValue: null,
        primaryKey: true,
        unique: true,
        type: Sequelize.STRING,
      },
      tag: {
        allowNull: false,
        defaultValue: null,
        primaryKey: true,
        unique: true,
        type: Sequelize.STRING,
      },
    })
    await queryInterface.createTable('Tag_Link', {
      id: {
        allowNull: false,
        defaultValue: null,
        primaryKey: 'id-table-id',
        type: Sequelize.UUID,
      },
      table: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: 'id-table-id',
      },
      foreign_key: {
        type: Sequelize.UUID,
        primaryKey: 'id-table-id',
        allowNull: false,
      },
    })


    await queryInterface.sequelize.query(`
      ALTER TABLE "public"."Tags"
        ADD CONSTRAINT tags_normalized_name_need_to_be_lowercase
          CHECK (normalized = lower(normalized));
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Tag_Link')
    await queryInterface.dropTable('Tags')
  },
}
