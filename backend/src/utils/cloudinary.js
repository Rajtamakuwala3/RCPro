// import {v2 as cloudinary} from 'cloudinary';
// import fs from 'fs';

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// })

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if(!localFilePath) {
//             return null;
//         }

//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: 'auto',
//         })
//         fs.unlinkSync(localFilePath)
//         return response
//     }
//     catch (error) {
//         fs.unlinkSync(localFilePath) // remove the locally temporary file as the operation got failed
//         return null
//     }
// }

// export {uploadOnCloudinary};

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// The 'fs' import is no longer needed. We are not interacting with the filesystem.

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error('No file buffer provided.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export { uploadOnCloudinary };