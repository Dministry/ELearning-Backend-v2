'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.string('userID').primary()
      table.string('firstName', 20).notNullable()
      table.string('lastName', 20).notNullable()
      table.string('mobileNumber', 50).notNullable()
      table.string('imageURL', 254)
      table.string('imageID', 254)
      table.boolean('emailConfirmed').defaultTo(false)
      table.boolean('isEnabled').defaultTo(true)
      table.text('description', 'text')
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.integer('roleID', 10).defaultTo(1)
      table.date('subscriptionExpiryDate')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
