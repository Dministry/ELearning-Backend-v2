'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */

const Factory = use('Factory')
const Database = use('Database')


class UserSeeder {
  async run () {
    const users = await Database.table('users').insert({ 
      userID: '57f89210-fd5f-11ea-81e0-e34be950fb0c',
      firstName: 'Elijah',
      lastName: 'Bobzom',
      email: 'ebobzom@gmail.com',
      mobileNumber: '0801000000',
      description: 'Learning Programing is Hard!!!!!!!!',
      password: '$2a$10$cEWjOQx2izdA.MggYqNTKOZ4/638VKPkcBqWixeYjOm69jv8/wvEe',
      roleID: 2
    })
  }
}

module.exports = UserSeeder
