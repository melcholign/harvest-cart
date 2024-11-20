import express from 'express';
import passport from 'passport';

import { initializePassport } from '../middleware/passport-config.js';
import { FarmerController } from '../controllers/farmerController.js';
import { FarmerModel } from '../models/farmerModel.js';


initializePassport(passport, FarmerModel.getByEmail, FarmerModel.getByID);

const farmerRouter = express.Router();
farmerRouter.use(passport.initialize());
farmerRouter.use(passport.session());

// Public routes
farmerRouter.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
})
farmerRouter.post('/register', checkNotAuthenticated, FarmerController.register);


farmerRouter.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
})
farmerRouter.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/farmer',
  failureRedirect: '/farmer/login',
  failureFlash: true
}));

// Protected routes
farmerRouter.get('', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.firstname })
})
farmerRouter.put('/update', checkAuthenticated, FarmerController.update);
farmerRouter.delete('/delete', checkAuthenticated, FarmerController.delete);


farmerRouter.post("/logout", checkAuthenticated, (req, res) => {
  req.logOut();
  res.redirect('/farmer/login');
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