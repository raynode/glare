'use strict'

const fs = require('fs')
const { join } = require('path')
const MimeType = require('mimetype')

const addImage = async (queryInterface, filename, name, source) => {
  const data = fs.readFileSync(join(__dirname, filename))
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
        source,
      },
    ],
    {},
  )

  const imageId = await queryInterface.rawSelect('Assets', { where: { name } }, ['id'])
  const id = await queryInterface.rawSelect('Posts', { where: { stub: 'my-stub' } }, ['id'])
  const query = `UPDATE "public"."Posts" SET "imageId" = '${imageId}' WHERE "id" = '${id}';`
  return queryInterface.sequelize.query(query)
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const url =
      'https://www.heise.de/foto/meldung/Wenn-Fotos-leuchten-Die-Bilder-der-Woche-KW-51-4257240.html?hg=1&hgi=0&hgf=false'
    await addImage(queryInterface, 'BdT_1512_Weihnachtlicher-Lichterzauber.jpg', 'Weihnachtlicher Lichterzauber', url)
    await addImage(queryInterface, 'BdT_1812_Der-Tag-erwacht.jpg', 'Der Tag erwacht', url)
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
}
