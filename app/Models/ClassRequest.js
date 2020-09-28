'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ClassRequest extends Model {
    static get primaryKey() {
        return "requestID";
    }
}

module.exports = ClassRequest
