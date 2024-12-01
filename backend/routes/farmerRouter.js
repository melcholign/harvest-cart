import express from 'express';
import { FarmerController } from '../controllers/farmerController.js';
import { passport } from '../middlewares/passport/passport-config.js';
import { FarmerModel } from '../models/farmerModel.js';
import fs from 'fs';

// configuring multer
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function(req, file, cb){
      let path;
      if(file.fieldname == 'nid' || file.fieldname == 'pfp'){
        if(!req.user){
          path = 'src/farmer/' + req.uniqueFarmerFolderName + '/';
        } else{
          path = req.user.nidImgPath.replace('nid.jpg','');
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
        if(file.fieldname == 'nid'){
          cb(null, 'nid.jpg');
        } else if(file.fieldname == 'pfp'){
          cb(null, 'pfp.jpg');
        } else{
          console.log('File fieldnames not matching for store image fields! NOTE: views file input tags name attribute should be gallery and cover');
        }
    }
});
const upload = multer( {storage: storage} );
const imageUpload = upload.fields([{ name: 'nid', maxCount: 1 }, { name: 'pfp', maxCount: 1 }])


const farmerRouter = express.Router();

// Public routes
farmerRouter.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
})
farmerRouter.post('/register', checkNotAuthenticated, prepImgUpload, imageUpload, FarmerController.register);

farmerRouter.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});
farmerRouter.post('/login', checkNotAuthenticated, passport.authenticate('local-farmer', {
  successRedirect: '/farmer',
  failureRedirect: '/farmer/login',
  failureFlash: true
}));

// Protected routes
farmerRouter.get('', checkAuthenticated, async (req, res) => {
  console.log(await FarmerModel.getStores(req.user.farmerId));
  res.render('index.ejs', {
    stores: await FarmerModel.getStores(req.user.farmerId),
    farmer: req.user
  })
})
farmerRouter.get('/update', checkAuthenticated, (req, res) => {
  res.render('updateFarmer.ejs', { farmer: req.user });
})
farmerRouter.post('/update', checkAuthenticated, imageUpload, FarmerController.update);
farmerRouter.post('/delete', checkAuthenticated, FarmerController.delete);
farmerRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
  });
  res.redirect('/farmer/login');
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/farmer/login');
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/farmer');
  }
  next();
}
function prepImgUpload(req, res, next){
  req.uniqueFarmerFolderName = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return next();
}

export { farmerRouter };