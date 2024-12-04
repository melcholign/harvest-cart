import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { StoreModel } from '../models/storeModel.js';
import { ProductModel } from '../models/product-model.js';
import fs from 'fs';
import multer from 'multer';

/**
 * Multer storage configuration for uploading images.
 */
const storage = multer.diskStorage({
    destination: function(req, file, cb){
      let path;
      if(file.fieldname == 'thumbnail'){
        path =  req.store.galleryImgsPath.replace('gallery','product');
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
          if(!req.product){
            req.uniqueProductName = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, req.uniqueProductName + '.jpg');
          }else{
            cb(null, /^.*\/(.*\.jpg)$/.exec(req.product.thumbnailImgPath).at(1));
          }
        } else{
          console.log('File fieldnames not matching for store image fields! NOTE: views file input tags name attribute should be gallery and cover');
        }
    }
});
const upload = multer( {storage: storage} );
const imageUpload = upload.single('thumbnail');

const productRouter = express.Router();

// Protected Dynamic routes

/**
 * Render the page for adding a new product.
 */
productRouter.get('/:storeId/product/add', checkAuthenticated, checkOwnership, async (req, res) => {
  res.render("productAdd.ejs", {store: res.locals.store});
})

/**
 * Add a new product.
 */
productRouter.post('/:storeId/product/add', checkAuthenticated, checkOwnership, imageUpload, ProductController.add);

/**
 * Render the page for updating a product.
 */
productRouter.get('/:storeId/product/:productId/update', checkAuthenticated, checkOwnership, (req, res) => {
  res.render('updateProduct.ejs', { product: res.locals.product });
})

/**
 * Update a product.
 */
productRouter.post('/:storeId/product/:productId/update', checkAuthenticated, checkOwnership, imageUpload, ProductController.update);

/**
 * Delete a product.
 */
productRouter.post('/:storeId/product/:productId/delete', checkAuthenticated, checkOwnership, ProductController.delete);


// middlewares
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
 * Middleware to check store ownership and product ownership if applicable.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @throws {Error} If the store or product does not exist or the user is not the owner.
 */
async function checkOwnership(req, res, next){
  try{
      const store = await StoreModel.getByID(req.params.storeId);
      if(!store){
        return res.json({ message: 'No store with such ID. '});
      }
      if(store.farmerId != req.user.farmerId){
          return res.json({ message: 'Access denied!'});
      }
      req.store = store;
      res.locals.store = store;

      if(req.params.productId){
        const product = await ProductModel.getByID(req.params.productId);
        if(!product){
          return res.json({ message: 'No product with such ID. '});
        }
        if(product.storeId != res.locals.store.storeId){
          return res.json({ message: 'This product does not belong to this store!'});
        }
        req.product = product;
        res.locals.product = product;
      }
      return next();
  }catch(err){
      console.log(err);
      return res.json({message: 'Server Error'});
  }
}

export { productRouter };