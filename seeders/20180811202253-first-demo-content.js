
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Users', [{
      givenName: 'Kopelke',
      familyName: 'Kopelke',
      nickname: 'Nox',
      name: 'Tobias',
      state: 'admin',
      picture: 'none...',
      email: 'nox@raynode.de',
      emailVerified: true,
    }, {
      givenName: 'Test',
      familyName: 'Test',
      nickname: 'TTest',
      name: 'Mr. Test',
      state: 'member',
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
      normalized: 'first!',
    }, {
      tag: 'Post',
      normalized: 'post',
    }, {
      tag: 'Nice',
      normalized: 'nice',
    }, {
      tag: 'Programming',
      normalized: 'programming',
    }, {
      tag: 'Postgres',
      normalized: 'postgres',
    }, {
      tag: 'Jest',
      normalized: 'jest',
    }, {
      tag: 'Testing',
      normalized: 'testing',
    }])

    await queryInterface.bulkInsert('Posts', [{
      stub: 'my-stub',
      title: 'My first Blogpost',
      image: 'unkown image :-(',
      userId,
    }])

    const getTagId = tag => queryInterface.rawSelect('Tags', { where: { tag }}, ['id'])

    const postId = await queryInterface.rawSelect('Posts', {
      where: {
        stub: 'my-stub',
      },
    }, ['id'])

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

    await queryInterface.bulkInsert('Bookmarks', [{
      name: 'Case insensitive UNIQUE constraints in Postgres',
      url: 'http://shuber.io/case-insensitive-unique-constraints-in-postgres/',
      userId: adminId,
    }, {
      name: 'Testing with Jest: 15 Awesome Tips and Tricks',
      url: 'https://medium.com/@stipsan/testing-with-jest-15-awesome-tips-and-tricks-42150ec4c262',
      userId: adminId,
    }])

    const bookmark1Id = await queryInterface.rawSelect('Bookmarks', {
      where: {
        name: 'Case insensitive UNIQUE constraints in Postgres',
      },
    }, ['id'])

    const bookmark2Id = await queryInterface.rawSelect('Bookmarks', {
      where: {
        name: 'Testing with Jest: 15 Awesome Tips and Tricks',
      },
    }, ['id'])

    const tagNiceId = await getTagId('Nice')
    const tagProgrammingId = await getTagId('Programming')
    await queryInterface.bulkInsert('Tag_Link', [{
      table: 'Post',
      foreign_key: postId,
      id: await getTagId('First!'),
    }, {
      table: 'Post',
      foreign_key: postId,
      id: await getTagId('Post'),
    }, {
      table: 'Post',
      foreign_key: postId,
      id: tagNiceId,
    }, {
      table: 'User',
      foreign_key: adminId,
      id: tagNiceId,
    }, {
      table: 'Account',
      foreign_key: accountId,
      id: tagNiceId,
    }, {
      table: 'Bookmark',
      foreign_key: bookmark1Id,
      id: tagNiceId,
    }, {
      table: 'Bookmark',
      foreign_key: bookmark1Id,
      id: await getTagId('Postgres'),
    }, {
      table: 'Bookmark',
      foreign_key: bookmark2Id,
      id: tagNiceId,
    }, {
      table: 'Bookmark',
      foreign_key: bookmark2Id,
      id: await getTagId('Jest'),
    }])

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
