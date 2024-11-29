import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { StoreModel } from '../models/storeModel.js';
import { Store } from 'express-session';

const productRouter = express.Router();

// Protected routes

productRouter.post('/add', checkAuthenticated, ProductController.add);
productRouter.get('/update', checkAuthenticated, (req, res) => {
  res.render('updateStore.ejs', { store: req.user });
})

// Protected Dynamic routes
productRouter.get('/:storeId/add', checkAuthenticated, checkOwnership, async (req, res) => {
    res.render("productAdd.ejs", {store: res.locals.store});
  })
productRouter.get('/:productId', checkAuthenticated, checkOwnership, async (req, res) =>{
  res.render("store.ejs", {
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