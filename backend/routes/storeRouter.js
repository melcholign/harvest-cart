import express from 'express';
import { StoreController } from '../controllers/storeController.js';
import { StoreModel } from '../models/storeModel.js';
import fs from 'fs';

// configuring multer
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function(req, file, cb){
      let path;
      if(file.fieldname == 'cover'){
        if(!req.store){
          path = req.user.nid_img_path.replace('nid.jpg','') + 'store/' + req.uniqueStoreFolderName + '/';
        } else{
          path = req.store.cover_img_path.replace('cover.jpg','');
        }
      } else if(file.fieldname == 'gallery'){
        if(!req.store){
          path = req.user.nid_img_path.replace('nid.jpg','') + 'store/' + req.uniqueStoreFolderName + '/gallery/';
        }else{
          path = req.store.gallery_imgs_path;
        }
        if(req.galleryImgCounter == 0 && fs.existsSync(path)){
          fs.rmSync(path, { recursive: true, force: true });
        }
      } else{
        console.log('File fieldnames not matching for store image fields! NOTE: views file input tags name attribute should be gallery and cover');
      }

      // if path does not exist, create the path
      if(!fs.existsSync(path)){
        fs.mkdirSync(path, { recursive: true });
      }
      
      cb(null, path);
    },
    filename: function(req, file, cb){
        if(file.fieldname == 'cover'){
          cb(null, 'cover.jpg');
        } else if(file.fieldname == 'gallery'){
          //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, (req.galleryImgCounter++) + '.jpg');
        } else{
          console.log('File fieldnames not matching for store image fields! NOTE: views file input tags name attribute should be gallery and cover');
        }
    }
});
const upload = multer( {storage: storage} );
const imageUpload = upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])

const storeRouter = express.Router();

// Protected routes
storeRouter.get('/add', checkAuthenticated, (req, res) => {
  res.render("storeAdd.ejs");
})
storeRouter.post('/add', checkAuthenticated, prepImgUpload, imageUpload, StoreController.add);


//dynamic routes
storeRouter.get('/:storeId/update', checkAuthenticated, checkOwnership, (req, res) => {
  res.render('updateStore.ejs', { store: res.locals.store });
})
storeRouter.post('/:storeId/update', checkAuthenticated, checkOwnership, prepImgUpload, imageUpload, StoreController.update);
//storeRouter.post('/:storeId/delete', checkAuthenticated, StoreController.delete);
storeRouter.get('/:storeId', checkAuthenticated, checkOwnership, StoreController.enterStore);


// middlewares
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/farmer/login');
}

async function checkOwnership(req, res, next){
  try{
      const store = await StoreModel.getByID(req.params.storeId);
      if(!store){
        return res.json({ message: 'No store with such ID. '});
      }
      if(store.farmer_id != req.user.farmer_id){
          return res.json({ message: 'Access denied!'});
      }
      req.store = store;
      res.locals.store = store;
      return next();
  }catch(err){
      console.log(err);
      return res.json({message: 'Server Error'});
  }
}

function prepImgUpload(req, res, next){
  req.uniqueStoreFolderName = Date.now() + '-' + Math.round(Math.random() * 1e9);
  req.galleryImgCounter = 0;
  return next();
}

export { storeRouter };