'use strict'

const uuid = require('uuid/v4')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'googleID', Sequelize.STRING)
  },
  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return queryInterface.removeColumn('Users', 'googleID')
  },
}
