'use strict'

const User = use('App/Models/User');
const sendEmail = use('App/Utility/SendMail');
const { uploadToCloudinary, deleteUploadedDoc } = use('App/Utility/Cloudinary');
const Database = use('Database');
const Hash = use('Hash');
const { validate } = use('Validator');
const randomStringGenerator = require('randomstring');
const forgotPasswordModel = use('App/Models/ForgotPassword')

class UserController {
    async login({ request, response, auth }){

        const validation = await validate(request.all(), {
            email: 'required|email',
            password: 'required'
        });
        
        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: 'incorrect email or password'
            });
        }

        const { email, password } = request.all();

        try {
            const user = await Database.select('*').from('users').where('email', email.toLowerCase());
            
            // verify if user exists
            if(user.length === 0){

                return response.status(400).json({
                    success: false,
                    message: 'user does not exist'
                });
            }

            const passwordOk = await Hash.verify(password, user[0].password);
            if(!passwordOk){

                return response.status(400).json({
                    success: false,
                    message: 'incorrect email or password'
                });
            }

            // fetch all required data
            // const publicCourses = await Database.select('*').from('courses').where('paid', false);
            // const publicSchedule = await Database.select('*').from('class_schedules').where('public', true);

            // fetch paid user courses
            // const userPaidCourses = await Database.select('*').from('courses').where('userID', user[0].userID);
            // const userPaidSchedule = await Database.select('*').from('class_schedules').where('ownerID', user[0].userID);
        
            // generate token
            const { token } = await auth.attempt(email.toLowerCase(), password)

            // delete user password
            delete user[0].password
            
            return response.status(200).json({
                success: true,
                message: {
                    user, token
                }
            });

        } catch (error) {
            // console.log('error', error.message)
            return response.status(400).json({
                success: false,
                message: error.message
            })
        }
    }

    async register({ request, response, auth }){

        // validate all inputs 
        const validation = await validate(request.all(), {
            firstName: 'required|alpha|min:2|max:20',
            lastName: 'required|alpha|min:2|max:20',
            email: 'required|email|unique:users,email',
            password: 'required',
            mobileNumber: 'required'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { firstName, lastName, email, password, mobileNumber, description } = request.all()

        try {
          
            // insert into databse
            const user = new User();
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email.toLowerCase();
            user.password = password;
            user.mobileNumber = mobileNumber;
            user.description = description;

            await user.save();

            const userDetails = await Database.select('*').from('users').where('email', email);

            // delete user password
            delete userDetails[0].password

            // generate token
            const { token } = await auth.attempt(email.toLowerCase(), password);

            // send email with link for password change
            const to = email;
            const sender = 'ebobzom@gmail.com';
            const subject = 'Password Change';
            const html = `
            <h1> Welcome Elearning </h1>
            <p> Welcome to one of the best learning platform </p>
            `
            const emailData = {
                from: sender,
                to, subject, html
            }
            
            try {
                // send email
                await sendEmail.sendEmail(emailData);

                return response.status(200).json({
                    success: true,
                    message: {
                        user: userDetails,
                        token
                    }
                });
            } catch (error) {
                return response.status(200).json({
                    success: true,
                    message: {
                        user: userDetails,
                        token,
                        emailSent: false
                    }
                })
            }

        } catch (error) {
            
            return response.status(400).json({
                success: false,
                message: error.message
            })
        }
    }

    async updateProfile({ request, response }){

        // validate all inputs 
        const validation = await validate(request.all(), {
            firstName: 'required|min:2|max:20',
            lastName: 'required|min:2|max:20',
            mobileNumber: 'required'
        });

        if(validation.fails()){
            
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { firstName, lastName, mobileNumber, description } = request.all()

        const dataToDb = { firstName, lastName, mobileNumber, description };
        try {
          
            // insert into databse
            await Database
            .table('users')
            .where('userID', request.payload.userID)
            .update(dataToDb)

            return response.status(200).json({
                success: true,
                message: 'profile updated successfully'
            });

        } catch (error) {
            
            return response.status(400).json({
                success: false,
                message: error.message
            })
        }
    }

    async resetPassword({ request, response, auth }){

        // validate inputs
        const validation = await validate(request.all(), {
            password: 'required|min:3',
            oldPassword: 'required|min:3'
        });

        if(validation.fails()){

            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        const { oldPassword, password } = request.all();

        // fetch user
        const user = await auth.getUser();

        // confirm if old password is correct
        const verificationValue = await Hash.verify(oldPassword, user.password);
        
        if(!verificationValue){
            return response.status(400).json({
                success: false,
                message: "Invalid old password provided"
            });
        }

        // hash password
        const hashedPassword = await Hash.make(password);

        // update password
        await Database
        .table('users')
        .where('userID', user.userID)
        .update({
            password: hashedPassword
        });

        return response.status(200).json({
            success: true,
            message: 'password reset successful'
        });
    }

    async forgotPassword({ request, response, auth }){
        const { email } = request.all();

        const validation = await validate(request.all(), {
            email: 'required|email'
        });

        if(validation.fails()){
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        // get user
        const userDetails = await Database.select('*').from('users').where('email', email.toLowerCase());

        // check if user with email exists
        if(userDetails.length == 0){
            return response.status(400).json({
                success: false,
                message: "please check your email"
            })
        }
        // generate random string
        const token = randomStringGenerator.generate();

        // save random string in forgotPassword table with user email
        try {
            const forgetPassword = await new forgotPasswordModel();
            forgetPassword.email = email.toLowerCase();
            forgetPassword.token = token;
            await forgetPassword.save();

        } catch (error) {

            //update if user alredy exists
            await Database
            .table('forgotPassword')
            .where('email', email)
            .update({
                token: token
            });
        }
        

        // send email with link for password change
        const to = email;
        const sender = 'ebobzom@gmail.com';
        const subject = 'Password Change';
        const html = `
        <h1> Elearning Password Change </h1>
        <p> Please click the link below to change your password </p>
        <p> <a href="https://www.google.com/${token}">Change Password</a></p>
        `
        const emailData = {
            from: sender,
            to, subject, html
        }
        
        try {
            // send email
            await sendEmail.sendEmail(emailData);

            return response.status(200).json({
                success: true,
                message: 'Email sent successfully'
            })
        } catch (error) {
            return response.status(400).json({
                success: false,
                message: 'Email not sent'
            })
        }

    }

    async updateForgottenPassword({ request, response }){

        const validation = await validate(request.all(), {
          email: 'required|email',
          password: 'required|min:3',
          token: 'required'
        });
    
        if(validation.fails()){
          return response.status(400).json({
            success: false,
            message: validation.messages()
          });
        }
    
        const { email, password, token } = request.all();
    
        //check if user email is in tokens table
        const userToken = await Database.select('token').from('forgotPassword').where('email', email.toLowerCase());
        if(userToken.length === 0){
          return response.status(400).json({
            success: false,
            message: 'forgot password link has expired'
          });
        }
    
        if(!token === userToken[0].token){
          return response.status(400).json({
            success: false,
            message: "unknown user with in valid token"
          });
        }
    
        // hash password 
        const hashedPassword = await Hash.make(password);
    
        // update user password
        await Database
        .table('users')
        .where('email', email)
        .update({
          password: hashedPassword
        });
    
        // delete token from database
        await Database
        .table('forgotPassword')
        .where('email', email)
        .del() 
    
        return response.status(200).json({
          success: true,
          message: 'password updated successfully'
        });
    
    }

    async uploadProfilePicture({ request, response, auth }){
        const file = request.file('file', {
            types: ['png,jpg,jpeg'],
            size: '2mb'
        });

        const validation = await validate(request.file('file'), {
            file: 'file_ext:png,jpg,jpeg|file_size:2mb|file_types:image'
        });

        // check if file is an image
        if(validation.fails()){
            
            return response.status(400).json({
                success: false,
                message: validation.messages()
            });
        }

        // get user
        const user = await auth.getUser();
        
        try{

            if(request.file('file')){

                // check if users profile picture already exists
                if(!user.imageURL){
                    // upload image
                    const result = await uploadToCloudinary(file)
    
                    // save to database
                    await Database
                    .table('users')
                    .where('email', user.email)
                    .update({
                        imageURL: result.secure_url,
                        imageID: result.public_id
                    });
                    
                    return response.status(200).json({
                        success: true,
                        message: result.secure_url
                    });

                }else{
                    // delete from cloudinary
                    await deleteUploadedDoc(user.profileImagePublicID)

                    // upload new image
                    const result = await uploadToCloudinary(file)

                    // save to database
                    await Database
                    .table('users')
                    .where('email', user.email)
                    .update({
                        imageURL: result.secure_url,
                        imageID: result.public_id
                    });
                    return response.status(200).json({
                        success: true,
                        message: result.secure_url
                    });
                }    
            }

            return response.json({status: false, data: 'Please upload an Image.'})

        }catch(error){
            
            return response.status(500).json({status: false, error: error.message })
        }
    }

    
}

module.exports = UserController
