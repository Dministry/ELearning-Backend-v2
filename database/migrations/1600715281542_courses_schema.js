'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CoursesSchema extends Schema {
  up () {
    this.create('courses', (table) => {
      table.increments('courseID').primary()
      table.string('courseTitle', 254)
      table.string('courseSubject')
      table.text('description', 'text')
      table.string('courseURL', 254)
      table.string('courseDuration', 100)
      table.string('userID', 254).unsigned().references('userID').inTable('users')
      table.boolean('paid').defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('courses')
  }
}

module.exports = CoursesSchema
