'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'googleID', Sequelize.STRING)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'googleID')
  },
}
