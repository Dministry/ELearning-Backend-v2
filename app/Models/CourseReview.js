'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CourseReview extends Model {
    static get primaryKey() {
        return "reviewID";
    }
}

module.exports = CourseReview
