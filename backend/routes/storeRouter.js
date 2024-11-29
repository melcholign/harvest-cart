import express from 'express';
import { StoreController } from '../controllers/storeController.js';

const storeRouter = express.Router();

// Protected routes
storeRouter.get('/add', checkAuthenticated, (req, res) => {
  res.render("storeAdd.ejs");
})
storeRouter.post('/add', checkAuthenticated, StoreController.add);
storeRouter.get('/update', checkAuthenticated, (req, res) => {
  res.render('updateStore.ejs', { store: req.user });
})
storeRouter.post('', checkAuthenticated, StoreController.enterStore);
//storeRouter.post('/update', checkAuthenticated, StoreController.update);
//storeRouter.post('/delete', checkAuthenticated, StoreController.delete);


// middlewares
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/farmer/login');
}

/*
async function checkOwnership(req, res, next){
  try{
      const store = await StoreModel.getByID(req.body.storeId);
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
*/

export { storeRouter };