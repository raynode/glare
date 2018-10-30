'use strict'

const fs = require('fs')
const { join } = require('path')
const MimeType = require('mimetype')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filename = 'logo.svg'
    const data = fs.readFileSync(join(__dirname, filename))
    const name = 'GodBlessTheChild'
    const mimetype = MimeType.lookup(filename)
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

    const imageId = await queryInterface.rawSelect('Assets', { where: { name } }, ['id'])

    const id = await queryInterface.rawSelect('Posts', { where: { stub: 'my-stub' } }, ['id'])

    const query = `UPDATE "public"."Posts" SET "imageId" = '${imageId}' WHERE "id" = '${id}';`
    const res = await queryInterface.sequelize.query(query)
  },

  down: async (queryInterface, Sequelize) => {},
}
