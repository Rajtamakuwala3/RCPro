// import multer from 'multer';

// const storage = multer.diskStorage({
//     destination: function(req, file, cb)  {
//         cb(null, "./public/temp");
//     },
//     filename: function(req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.originalname)
//     }
// });


// export const upload = multer({ storage: storage })

import multer from "multer";

// We no longer need path, fileURLToPath, or fs for this configuration.
// By using memoryStorage, we avoid dealing with the filesystem entirely.

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Optional: limit file size to 10MB
  },
});

