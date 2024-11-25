import { express } from 'express';
import { multer } from 'multer';

const storeRouter = express.Router();

// Configure multer for storing files in the disk at specified path(../src/cover_imgs) with specified filename(savedImage) and extension (.png)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const uniqueFolder = req.

    cb(null, '../src/imgs/farmer/store')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
  }
})
const upload = multer({ storage: storage })

 
storeRouter.post("/create", upload.array(
    [   { name: 'cover_img', maxCount: 1}, 
        { name: 'gallery_imgs', maxCount: 15}   ]), 
    (req, res, next) => {
        const cover_img_path = req.files['cover_img'][0].destination + '/' + req.files['cover_img'][0].filename;
})
