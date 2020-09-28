'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.post('register', 'UserController.register')
  Route.post('/login', 'UserController.login')
  Route.put('profile', 'UserController.updateProfile').middleware(['auth'])
  Route.put('resetPassword', 'UserController.resetPassword').middleware(['auth'])
  Route.post('forgotPassword', 'UserController.forgotPassword')
  Route.put('forgotPassword', 'UserController.updateForgottenPassword')

  // SCHEDULE

  // Admin
  Route.post('schedule', 'ClassController.createSchedule').middleware(['auth'])
  Route.put('schedule', 'ClassController.updateSchedule').middleware(['auth'])
  Route.delete('schedule/:scheduleID', 'ClassController.deleteSchedule').middleware(['auth'])
  Route.get('schedule/all', 'ClassController.fetchAllSchedule').middleware(['auth'])

   // COURSE
  Route.get('request', 'ClassController.fetchAllRequests').middleware(['auth']) // fetch user requests 
  Route.post('/course', 'ClassController.addCourse').middleware(['auth'])
  Route.put('course', 'ClassController.updateCourse').middleware(['auth'])
  Route.delete('course/:courseID', 'ClassController.deleteCourse').middleware(['auth'])
  Route.get('course/:userID', 'ClassController.fetchUserCourse').middleware(['auth'])
  Route.get('course', 'ClassController.fetchAllCourses').middleware(['auth'])

  // Reviews
  Route.post('review', 'ClassController.addReview').middleware(['auth'])
  Route.put('review', 'ClassController.updateReview').middleware(['auth'])
  Route.delete('review/:reviewID', 'ClassController.deleteReview').middleware(['auth'])
  Route.get('review/:courseID', 'ClassController.fetchCourseReview').middleware(['auth'])
  Route.get('review', 'ClassController.fetchAllCourseReview').middleware(['auth'])

  // User ROUTES
  Route.get('schedule/:ownerID', 'ClassController.fetchUserSchedule').middleware(['auth']) // schedule for one user
  Route.get('schedule/public', 'ClassController.fetchPublicSchedule').middleware(['auth']) // schedule for free classes
  Route.post('request', 'ClassController.createClassRequest').middleware(['auth']) // make request 
  Route.put('request', 'ClassController.updateClassRequest').middleware(['auth'])  // update request
  Route.delete('request/:requestID', 'ClassController.deleteClassRequest').middleware(['auth']) // delete a request 
  Route.get('request/user', 'ClassController.fetchUserRequest').middleware(['auth']) // fetch user requests 
  Route.post('profile', 'UserController.uploadProfilePicture').middleware(['auth'])


}).prefix('/api/v1/')


