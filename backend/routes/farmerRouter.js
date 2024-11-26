import express from 'express';
import { FarmerController } from '../controllers/farmerController.js';
import { passport } from '../middlewares/passport/passport-config.js';

const farmerRouter = express.Router();

// Public routes
farmerRouter.get('/register', checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
})
farmerRouter.post('/register', checkNotAuthenticated, FarmerController.register);

farmerRouter.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});
farmerRouter.post('/login', checkNotAuthenticated, passport.authenticate('local-farmer', {
  successRedirect: '/farmer',
  failureRedirect: '/farmer/login',
  failureFlash: true
}));

// Protected routes
farmerRouter.get('', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.firstname + " " + req.user.lastname })
})
farmerRouter.get('/update', checkAuthenticated, (req, res) => {
  res.render('updateFarmer.ejs', { farmer: req.user });
})
farmerRouter.post('/update', checkAuthenticated, FarmerController.update);
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

export { farmerRouter };