'use strict'

// Hier sollte ich noch einmal drüber nachdenken,
// Ich möchte erreichen das gesehene Links in der Heise-Liste
// für mich einen counter bekommen
// D.h. ich brauche einen Integer der hochzählt.
// Wenn ich das in Links einbaue, dann ist es nicht User-abhängig
// Es ginge über Tags, dann könnte man ein view:user-id tag machen, und Tags würden einen counter bekommen

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('Links', 'source', {
    //   allowNull: true,
    //   type: Sequelize.STRING,
    // })
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('Links', 'source')
  },
}
