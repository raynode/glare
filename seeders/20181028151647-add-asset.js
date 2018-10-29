'use strict'

const fs = require('fs')
const { join } = require('path')
const MimeType = require('mimetype')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const data = fs.readFileSync(join(__dirname, 'logo.svg'))
    const name = 'GodBlessTheChild-Logo.svg'
    const mimetype = MimeType.lookup(name)
    const type = mimetype.split('/')[0]

    await queryInterface.bulkInsert(
      'Assets',
      [
        {
          name,
          type,
          mimetype,
          data,
        },
      ],
      {},
    )
  },

  down: async (queryInterface, Sequelize) => {},
}
