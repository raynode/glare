'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Users', [{
      givenName: 'Kopelke',
      familyName: 'Kopelke',
      nickname: 'Nox',
      name: 'Tobias',
      picture: 'none...',
      email: 'nox@raynode.de',
      emailVerified: true,
    }, {
      givenName: 'Test',
      familyName: 'Test',
      nickname: 'TTest',
      name: 'Mr. Test',
      picture: 'none...',
      email: 'test@raynode.de',
      emailVerified: true,
    }], {});

    const adminId = await queryInterface.rawSelect('Users', {
      where: {
        email: 'nox@raynode.de',
      },
    }, ['id'])

    const userId = await queryInterface.rawSelect('Users', {
      where: {
        email: 'test@raynode.de',
      },
    }, ['id'])

    await queryInterface.bulkInsert('Tags', [{
      tag: 'First!',
    }, {
      tag: 'Post',
    }])

    await queryInterface.bulkInsert('Posts', [{
      stub: 'my-stub',
      title: 'My first Blogpost',
      AuthorId: userId,
    }])

    const postId = await queryInterface.rawSelect('Posts', {
      where: {
        stub: 'my-stub',
      },
    }, ['id'])

    const tagFirstId = await queryInterface.rawSelect('Tags', {
      where: {
        tag: 'First!',
      },
    }, ['id'])

    const tagPostId = await queryInterface.rawSelect('Tags', {
      where: {
        tag: 'Post',
      },
    }, ['id'])

    await queryInterface.bulkInsert('Tag_Link', [{
      table: 'Posts',
      foreign_key: postId,
      id: tagFirstId,
    }, {
      table: 'Posts',
      foreign_key: postId,
      id: tagPostId,
    }])

    await queryInterface.bulkInsert('Accounts', [{
      amount: 100,
    }])

    const accountId = await queryInterface.rawSelect('Accounts', {
      where: {
        amount: 100,
      },
    }, ['id'])

    await queryInterface.bulkInsert('account_owners', [{
      accountId,
      userId,
    }, {
      accountId,
      userId: adminId,
    }])

    await queryInterface.bulkInsert('Expenses', [{
      amount: 100,
      userId: adminId,
      accountId,
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
