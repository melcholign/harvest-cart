import express from 'express';
import createCustomerValidator from '../validators/customer/customer-validator.js';
import { CustomerController } from '../controllers/customer-controller.js';
import { VerificationController } from '../controllers/verification-controller.js';
import { passport } from '../middlewares/passport/passport-config.js';
import { isAuthenticated } from '../middlewares/is-authenticated.js';

const router = express.Router();

router.get('/account/registration', (req, res) => {
    if ('user' in req) {
        return res.redirect('/');
    }

    return res.render('customer/registration.ejs', {formData: {}, errors: {}, globalError: ''});
})
router.post('/account/registration', createCustomerValidator(), CustomerController.createCustomer);
router.get('/account/verification', isAuthenticated, VerificationController.initiateAccountVerification);
router.post('/account/verification', isAuthenticated, VerificationController.completeAccountVerification);

router.get('/account/login', (req, res) => {
    if ('user' in req) {
        return res.redirect('/');
    }

    return res.render('customer/login.ejs', { errorMessage: null, errors: {}, email: '' });
});
router.post('/account/login',
    (req, res, next) => {
    passport.authenticate('local-customer', (err, user, info) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
            return res.render('customer/login.ejs', {
                errorMessage: 'Incorrect email or password. Please try again.',
                errors: {},
                email: req.body.email, 
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); 
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.post('/account/logout', (res, req) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        res.sendStatus(200);
    });
});

export {
    router as customerRouter
};