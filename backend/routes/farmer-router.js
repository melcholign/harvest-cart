import express from 'express';
import { FarmerController } from '../controllers/farmer-controller.js';
import { passport } from '../middlewares/passport/passport-config.js';
import { FarmerModel } from '../models/farmer-model.js';
import fs from 'fs';
import multer from 'multer';

/**
 * Multer storage configuration for uploading images.
 */
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
/**
 * Render the registration page.
 */
farmerRouter.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
})
/**
 * Register a new farmer.
 */
farmerRouter.post('/register', checkNotAuthenticated, prepImgUpload, imageUpload, FarmerController.register);

/**
 * Render the login page.
 */
farmerRouter.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

/**
 * Authenticate and login a farmer.
 */
farmerRouter.post('/login', checkNotAuthenticated, passport.authenticate('local-farmer', {
  successRedirect: '/farmer',
  failureRedirect: '/farmer/login',
  failureFlash: true
}));

// Protected routes
/**
 * Render the farmer dashboard.
 */
farmerRouter.get('', checkAuthenticated, async (req, res) => {
  console.log(await FarmerModel.getStores(req.user.farmerId));
  res.render('index.ejs', {
    stores: await FarmerModel.getStores(req.user.farmerId),
    farmer: req.user
  })
})
/**
 * Render the update farmer page.
 */
farmerRouter.get('/update', checkAuthenticated, (req, res) => {
  res.render('updateFarmer.ejs', { farmer: req.user });
})
/**
  * Update a farmer's information.
  */
farmerRouter.post('/update', checkAuthenticated, imageUpload, FarmerController.update);
/**
  * Delete a farmer account.
  */
farmerRouter.post('/delete', checkAuthenticated, FarmerController.delete);
/**
  * Logout a farmer.
  */
farmerRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
  });
  res.redirect('/farmer/login');
})


/**
 * Middleware to check if the user is authenticated.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/farmer/login');
}
/**
 * Middleware to check if the user is not authenticated.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/farmer');
  }
  next();
}

/**
 * Middleware to prepare image upload by setting a unique folder name.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function prepImgUpload(req, res, next){
  req.uniqueFarmerFolderName = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return next();
}

export { farmerRouter };