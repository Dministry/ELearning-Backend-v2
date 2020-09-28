'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ForgotPasswordSchema extends Schema {
  up () {
    this.create('forgotPassword', (table) => {
      table.increments()
      table.string('email', 120).notNullable().unique()
      table.string('token', 255)
      table.timestamps()
    })
  }

  down () {
    this.drop('forgotPassword')
  }
}

module.exports = ForgotPasswordSchema
