import express from 'express';
import { farmerController } from '../controllers/farmerController';
import passport from 'passport';


passport.use(new LocalStrategy(
    function(username, password, done) {
      farmerController.getByID({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));


const router = express.Router();

// Public routes
router.post('/register', farmerController.register);
router.post('/login', farmerController.login);

// Protected routes
router.put('/update', authMiddleware, farmerController.update);
router.delete('/delete', authMiddleware, userController.removeFromCart);

module.exports = router;