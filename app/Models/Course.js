'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Course extends Model {
    static get primaryKey() {
        return "courseID";
    }
}

module.exports = Course
