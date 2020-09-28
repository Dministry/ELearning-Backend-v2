'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseReviewSchema extends Schema {
  up () {
    this.create('course_reviews', (table) => {
      table.increments('reviewID').primary()
      table.integer('courseID')
      table.text('review', 'text')
      table.string('userID', 254).unsigned().references('userID').inTable('users')
      table.timestamps()
    })
  }

  down () {
    this.drop('course_reviews')
  }
}

module.exports = CourseReviewSchema
