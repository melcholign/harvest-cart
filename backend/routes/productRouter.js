import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { StoreModel } from '../models/storeModel.js';
import { Store } from 'express-session';
import fs from 'fs';

// configuring multer
import multer from 'multer';
const storage = multer.diskStorage({
    destination: function(req, file, cb){
      let path;
      if(file.fieldname == 'thumbnail'){
        path = 'src/farmer/' + req.user.farmer_id + '/store/' + req.body.store_name + '/product/';
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
        if(file.fieldname == 'thumbnail'){
          cb(null, req.body.productName + '.jpg');
        } else{
          console.log('File fieldnames not matching for store image fields! NOTE: views file input tags name attribute should be gallery and cover');
        }
    }
});
const upload = multer( {storage: storage} );
const imageUpload = upload.single('thumbnail');



const productRouter = express.Router();

// Protected routes
productRouter.get('/:storeId/product/add', checkAuthenticated, checkOwnership, async (req, res) => {
  res.render("productAdd.ejs", {store: res.locals.store});
})
productRouter.post('/:storeId/product/add', checkAuthenticated, checkOwnership, imageUpload, ProductController.add);

productRouter.get('/:storeId/product/update', checkAuthenticated, (req, res) => {
  res.render('updateStore.ejs', { store: req.user });
})

// Protected Dynamic routes
productRouter.get('/:storeId/product/:productId', checkAuthenticated, checkOwnership, async (req, res) =>{
  res.render("product.ejs", {
    store: res.locals.store,
    products: await StoreModel.getProducts(req.params.storeId)});
});
//productRouter.post('/update', checkAuthenticated, ProductController.update);
//productRouter.post('/delete', checkAuthenticated, ProductController.delete);


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
      res.locals.store = store;
      return next();
  }catch(err){
      console.log(err);
      return res.json({message: 'Server Error'});
  }
}

export { productRouter };