import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { StoreModel } from '../models/storeModel.js';
import { ProductModel } from '../models/product-model.js';
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

// Protected Dynamic routes
productRouter.get('/:storeId/product/add', checkAuthenticated, checkOwnership, async (req, res) => {
  res.render("productAdd.ejs", {store: res.locals.store});
})
productRouter.post('/:storeId/product/add', checkAuthenticated, checkOwnership, imageUpload, ProductController.add);

productRouter.get('/:storeId/product/:productId/update', checkAuthenticated, checkOwnership, (req, res) => {
  res.render('updateProduct.ejs', { product: res.locals.product });
})
productRouter.post('/:storeId/product/:productId/update', checkAuthenticated, checkOwnership, imageUpload, ProductController.update);

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

      if(req.params.productId){
        const product = await ProductModel.getByID(req.params.productId);
        if(!product){
          return res.json({ message: 'No product with such ID. '});
        }
        if(product.storeId != res.locals.store.storeId){
          return res.json({ message: 'This product does not belong to this store!'});
        }
        res.locals.product = product;
      }
      return next();
  }catch(err){
      console.log(err);
      return res.json({message: 'Server Error'});
  }
}

export { productRouter };