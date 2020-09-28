'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ForgotPassword extends Model {
    static get table() {
        return "forgotPassword";
    }
}

module.exports = ForgotPassword
