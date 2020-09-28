'use strict'

const cloudinary = use('cloudinary')
const Env = use('Env')

cloudinary.config({

    cloud_name: Env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: Env.get('CLOUDINARY_API_KEY'),
    api_secret: Env.get('CLOUDINARY_API_SECRET'),
});

async function uploadToCloudinary(file){

    return new Promise(async (resolve, reject) => {

        try{

            let response = await cloudinary.uploader.upload(file.tmpPath, { folder: 'profile_picture' })

            resolve({status: true, secure_url: response.secure_url, public_id: response.public_id, original_filename: response.original_filename })

        }catch(error){
            
            reject({status: false, message: error.message })
        }
    })
}

async function deleteUploadedDoc(publicID){
    return new Promise(async (resolve, reject) => {

        try{

            await cloudinary.uploader.destroy(publicID, { invalidate: true })

            resolve({status: true, message: 'deleted successfully' });

        }catch(error){
            
            reject({status: false, message: error.message })
        }
    })
}

module.exports = { uploadToCloudinary, deleteUploadedDoc };