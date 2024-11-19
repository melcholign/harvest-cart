import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve('..', '.env') });


import { express } from 'express';
import { FarmerController } from '../controllers/farmerController.js';
import { FarmerModel } from '../models/farmerModel';
import { passport } from 'passport';
import { initializePassport } from '../middleware/passport-config';
import { flash } from 'express-flash';
import { session } from 'express-session';

initializePassport(passport, FarmerModel.getByEmail, FarmerModel.getByID)

const farmerRouter = express.Router();
farmerRouter.use(flash());
farmerRouter.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
farmerRouter.use(passport.initialize());
farmerRouter.use(passport.session());

// Public routes
farmerRouter.post('/register', checkNotAuthenticated, FarmerController.register);
farmerRouter.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/farmer',
  failureRedirect: '/farmer/login',
  failureFlash: true
}));

// Protected routes
farmerRouter.put('/update', checkAuthenticated, FarmerController.update);
farmerRouter.delete('/delete', checkAuthenticated, FarmerController.delete);


farmerRouter.post("/logout", (req, res) => {
  req.logOut();
  req.redirect('/farmer/login');
})


function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/farmer/login');
}

function checkNotAuthenticated(req, res, next) {
  if(req.isAuthenticated()){
    return res.redirect('/');
  }
  next();
}

export {farmerRouter};