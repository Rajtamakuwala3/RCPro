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
import path from "path";
import { fileURLToPath } from "url";

// Resolve project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/temp")); // always absolute
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage });
