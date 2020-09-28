'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ClassScheduleSchema extends Schema {
  up () {
    this.create('class_schedules', (table) => {
      table.increments('scheduleID').primary()
      table.string('courseTitle', 100)
      table.text('description', 'text')
      table.text('locationLink', 'text')
      table.string('startTime', 30)
      table.date('scheduleDate')
      table.string('ownerID', 254)
      table.boolean('public').defaultTo(false)
      table.boolean('done').defaultTo(false)
      table.boolean('live').defaultTo(false)
      table.string('userID', 254).unsigned().references('userID').inTable('users')
      table.timestamps()
    })
  }

  down () {
    this.drop('class_schedules')
  }
}

module.exports = ClassScheduleSchema
