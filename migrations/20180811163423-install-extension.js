'use strict';

const uuid = require('uuid/v4');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;')
    queryInterface.sequelize.query(`
CREATE OR REPLACE FUNCTION updateUpdatedAt()
    RETURNS TRIGGER AS '
  BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
  END;
' LANGUAGE 'plpgsql'
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP EXTENSION pgcrypto;')
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS updateUpdatedAt;')
  }
};
