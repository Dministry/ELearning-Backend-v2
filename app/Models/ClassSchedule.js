'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ClassSchedule extends Model {
    static get primaryKey() {
        return "scheduleID";
    }
}

module.exports = ClassSchedule
