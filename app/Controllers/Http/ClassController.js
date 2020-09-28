'use strict'

const Schedule = use('App/Models/ClassSchedule');
const ClassRequest = use('App/Models/ClassRequest');
const Review = use('App/Models/CourseReview');
const Course = use('App/Models/Course');
const Database = use('Database');
const { validate } = use('Validator');

class ClassController {

    /**
     * SCHEDULE HANDLERS
     * ====================================================================================================
     */

    async createSchedule({ request, response }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // validate input
        const validation = await validate(request.all(), {
            courseTitle: 'required',
            description: 'required',
            startTime: 'required',
            scheduleDate: 'required',
            ownerID: 'required',
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { courseTitle, description, startTime, scheduleDate, ownerID, locationLink, free } = request.all();

        try {
            
            // save in database
            const schedule = new Schedule();

            schedule.courseTitle = courseTitle;
            schedule.description = description;
            schedule.startTime = startTime;
            schedule.scheduleDate = scheduleDate;
            schedule.ownerID = ownerID;
            schedule.locationLink = locationLink;
            schedule.public = free || false;
            schedule.done = false;
            await schedule.save();

            // fetch schedule for user
            const userSchedule = await Database
            .select('*')
            .from('class_schedules')
            .where('ownerID', ownerID);

            return response.status(200).json({
                success: true,
                message: userSchedule
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }


    }

    async updateSchedule({ request, response }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // validate input
        const validation = await validate(request.all(), {
            scheduleID: 'required',
            courseTitle: 'required',
            description: 'required',
            startTime: 'required',
            scheduleDate: 'required',
            ownerID: 'required',
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { courseTitle, description, startTime, scheduleDate, ownerID, scheduleID, locationLink } = request.all();
        const dataToDB = { courseTitle, description, startTime, scheduleDate, ownerID, scheduleID, locationLink }
        try {
            
            // update schedule in database
            await Database
            .table('class_schedules')
            .where('scheduleID', scheduleID)
            .update(dataToDB)

            // fetch schedule for user
            const userSchedule = await Database
            .select('*')
            .from('class_schedules')
            .where('ownerID', ownerID);

            return response.status(200).json({
                success: true,
                message: userSchedule
            });

        } catch (error) {
            console.log(error)
            return response.status(400).json({
                success: false,
                message: error.message
            });
            
        }


    }

    async deleteSchedule({ request, response, params }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // validate inputs
        const validation = await validate(params, { 
            scheduleID: 'required|integer'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { scheduleID }= params;

        // delete from database
        await Database
        .table('class_schedules')
        .where('scheduleID', scheduleID)
        .del();

        // fetch schedule 
        const userSchedule = await Database
        .select('*')
        .from('class_schedules');
        

        return response.status(200).json({
            success: true,
            message: userSchedule
        });
    }

    async fetchUserSchedule({ response, params }){

        // validate inputs
        const validation = await validate(params, { 
            ownerID: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { ownerID }= params;

        // fetch schedule for user
        const userSchedule = await Database
        .select('*')
        .from('class_schedules')
        .where('ownerID', ownerID);

        // fetch free class schedule
        const freeSchedule = await Database
        .select('*')
        .from('class_schedules')
        .where('public', true);
        

        return response.status(200).json({
            success: true,
            message: [...userSchedule, ...freeSchedule]
        });
    }

    async fetchPublicSchedule({ response }){

        // fetch schedule for public
        const userSchedule = await Database
        .select('*')
        .from('class_schedules')
        .where('public', true);
        

        return response.status(200).json({
            success: true,
            message: userSchedule
        });
    }

    async fetchAllSchedule({ request, response }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // fetch schedule for public
        const userSchedule = await Database
        .select('*')
        .from('class_schedules');
        

        return response.status(200).json({
            success: true,
            message: userSchedule
        });
    }

    /**
     * CLASS REQUEST HANDLERS
     * ====================================================================================================
     */

    async createClassRequest({ request, response }){

        // check if user subscription has expired
        let currentDate = new Date();
        let userSubcriptionEndDate = new Date(request.payload.subscriptionExpiryDate);

        if(userSubcriptionEndDate < currentDate){
            return response.status(400).json({
                success: false,
                message: 'Please subscribe to get this feature'
            });
        }

        // validate input
        const validation = await validate(request.all(), {
            subject: 'required',
            topic: 'required',
            studentClass: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { subject, topic, studentClass } = request.all();

        try {
            
            // save in database
            const classRequest = new ClassRequest();

            classRequest.subject = subject;
            classRequest.topic = topic;
            classRequest.studentClass = studentClass;
            classRequest.userID = request.payload.userID;
            await classRequest.save();

            // fetch schedule for user
            const userRequests = await Database
            .select('*')
            .from('class_requests')
            .where('userID', request.payload.userID);

            return response.status(200).json({
                success: true,
                message: userRequests
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }
    }

    async updateClassRequest({ request, response }){

        // check if user subscription has expired
        let currentDate = new Date();
        let userSubcriptionEndDate = new Date(request.payload.subscriptionExpiryDate);

        if(userSubcriptionEndDate < currentDate){
            return response.status(400).json({
                success: false,
                message: 'Please subscribe to get this feature'
            });
        }

        // validate input
        const validation = await validate(request.all(), {
            requestID: 'required|integer',
            subject: 'required',
            topic: 'required',
            studentClass: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { subject, topic, studentClass, requestID } = request.all();
        const dataToDB = { subject, topic, studentClass }
        try {
            
            // update database
            await Database
            .table('class_requests')
            .where('requestID', requestID)
            .update(dataToDB)

            // fetch schedule for user
            const userRequests = await Database
            .select('*')
            .from('class_requests')
            .where('userID', request.payload.userID);

            return response.status(200).json({
                success: true,
                message: userRequests
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }
    }

    async deleteClassRequest({ response, params }){

        // validate inputs
        const validation = await validate(params, { 
            requestID: 'required|integer'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { requestID }= params;

        // delete from database
        await Database
        .table('class_requests')
        .where('requestID', requestID)
        .del();

        // fetch schedule 
        const userRequests = await Database
        .select('*')
        .from('class_requests');
        

        return response.status(200).json({
            success: true,
            message: userRequests
        });
    }

    async fetchUserRequest({ request, response }){

        // fetch schedule for user
        const userRequests = await Database
        .select('*')
        .from('class_requests')
        .where('userID', request.payload.userID);
        

        return response.status(200).json({
            success: true,
            message: userRequests
        });
    }

    async fetchAllRequests({ request, response }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // fetch schedule for public
        const allRequests = await Database
        .select('*')
        .from('class_requests');
        

        return response.status(200).json({
            success: true,
            message: allRequests 
        });
    }

    /**
     * COURSE HANDLERS
     * ====================================================================================================
     */

    async addCourse({ request, response }){

        
        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // validate input
        const validation = await validate(request.all(), {
            courseTitle: 'required',
            courseSubject: 'required',
            description: 'required',
            courseURL: 'required',
            courseDuration: 'required',
            userID: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { courseTitle, courseSubject, description, courseURL, courseDuration, userID, paid } = request.all();

        try {
            
            // save in database
            const course = new Course();

            course.courseTitle = courseTitle;
            course.courseSubject = courseSubject;
            course.description = description;
            course.courseURL = courseURL;
            course.courseDuration= courseDuration;
            course.userID = userID;
            course.paid = paid;
            await course.save();

            // fetch course for user
            const userCourses = await Database
            .select('*')
            .from('courses')
            .where('userID', userID);

            return response.status(200).json({
                success: true,
                message: userCourses
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }
    }

    async updateCourse({ request, response }){

        
        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // validate input
        const validation = await validate(request.all(), {
            courseID: 'required',
            courseTitle: 'required',
            courseSubject: 'required',
            description: 'required',
            courseURL: 'required',
            courseDuration: 'required',
            userID: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { courseTitle, courseSubject, description, courseURL, courseDuration, userID, courseID } = request.all();
        const dataToDB = { courseTitle, courseSubject, description, courseURL, courseDuration, userID, courseID };
        try {
            
            // save in database
            await Database
            .table('courses')
            .where('courseID', courseID)
            .update(dataToDB);

            // fetch courses for user
            const userCourses = await Database
            .select('*')
            .from('courses')
            .where('userID', userID);

            return response.status(200).json({
                success: true,
                message: userCourses
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }
    }

    async deleteCourse({ request, response, params }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // validate inputs
        const validation = await validate(params, { 
            courseID: 'required|integer'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { courseID }= params;

        // delete from database
        await Database
        .table('courses')
        .where('courseID', courseID)
        .del();

        // fetch courses 
        const userCourses = await Database
        .select('*')
        .from('courses');
        

        return response.status(200).json({
            success: true,
            message: userCourses
        });
    }

    async fetchUserCourse({ params, response }){

        // validate inputs
        const validation = await validate(params, { 
            userID: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { userID }= params;

        // fetch course for user
        const userCourses = await Database
        .select('*')
        .from('courses')
        .where('userID', userID);

        // fetch free courses
        const userFreeCourses = await Database
        .select('*')
        .from('courses')
        .where('paid', false);
        
        const combinedCourses =  [...userFreeCourses, ...userCourses ]
        

        return response.status(200).json({
            success: true,
            message: combinedCourses
        });
    }

    async fetchAllCourses({  request, response }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // fetch course for user
        const courses = await Database
        .select('*')
        .from('courses')
        
        return response.status(200).json({
            success: true,
            message: courses
        });
    }

     /**
     * REVIEW HANDLERS
     * ====================================================================================================
     */

    async addReview({ request, response }){

        // validate input
        const validation = await validate(request.all(), {
            courseID: 'required|integer',
            review: 'required',
            userID: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { courseID, review, userID } = request.all();

        try {
            
            // save in database
            const reviews = new Review();

            reviews.courseID = courseID;
            reviews.review = review;
            reviews.userID = userID;
            await reviews.save();

            // fetch courses for user
            const courseReviews = await Database
            .select('*')
            .from('course_reviews')
            .where('userID', userID);

            return response.status(200).json({
                success: true,
                message: courseReviews
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }
    }

    async updateReview({ request, response }){

        // validate input
        const validation = await validate(request.all(), {
            reviewID: 'required|integer',
            userID: 'required',
            review: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { review, reviewID, userID } = request.all();
        const dataToDB = { review };

        try {
            
            // save in database
            await Database
            .table('course_reviews')
            .where('reviewID', reviewID)
            .update(dataToDB)

            // fetch schedule for user
            const courseReviews = await Database
            .select('*')
            .from('course_reviews')
            .where('userID', userID);

            return response.status(200).json({
                success: true,
                message: courseReviews
            });

        } catch (error) {

            return response.status(400).json({
                success: true,
                message: error.message
            });
            
        }
    }

    async deleteReview({ response, params }){

        // validate inputs
        const validation = await validate(params, { 
            reviewID: 'required|integer'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { reviewID }= params;

        // delete from database
        await Database
        .table('course_reviews')
        .where('reviewID', reviewID)
        .del();
        
        return response.status(200).json({
            success: true,
            message: 'review deleted successfully'
        });
    }

    async fetchCourseReview({ params, response }){

        // validate inputs
        const validation = await validate(params, { 
            courseID: 'required|integer'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            })
        }

        const { courseID }= params;

        // fetch course reviews
        const courseReviews = await Database
        .select('*')
        .from('course_reviews')
        .where('courseID', courseID);
        

        return response.status(200).json({
            success: true,
            message: courseReviews
        });
    }

    async fetchAllCourseReview({ request, response }){

        // check if user is an admin/subAdmin
        if(request.payload.roleID === 1){
            return response.status(400).json({
                success: false,
                message: 'Admin or teacher required'
            });
        }

        // fetch course reviews
        const courseReviews = await Database
        .select('*')
        .from('course_reviews')
        

        return response.status(200).json({
            success: true,
            message: courseReviews
        });
    }

}

module.exports = ClassController
