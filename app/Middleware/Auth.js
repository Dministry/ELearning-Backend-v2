'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Auth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response, auth }, next) {
    // call next to advance the request

    try {
      const user = await auth.getUser();
      request.payload = user;
      await next()
      
    } catch (error) {
      console.log(error)
      return response.status(400).json({
        success: false,
        message: error.message
      });
    }
    
  }
}

module.exports = Auth
