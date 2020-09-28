'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ClassRequestSchema extends Schema {
  up () {
    this.create('class_requests', (table) => {
      table.increments('requestID').primary()
      table.string('subject', 50)
      table.string('topic', 254)
      table.string('studentClass', 254)
      table.string('userID', 254).unsigned().references('userID').inTable('users')
      table.timestamps()
    })
  }

  down () {
    this.drop('class_requests')
  }
}

module.exports = ClassRequestSchema
