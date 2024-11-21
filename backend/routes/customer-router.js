import express from 'express';
import createCustomerValidator from '../validators/customer/customer-validator.js';
import { CustomerController } from '../controllers/customer-controller.js';
import { passport } from '../middlewares/passport/passport-config.js';

const router = express.Router();

router.post('/create', createCustomerValidator(), CustomerController.createCustomer);
router.post('/login',
    passport.authenticate('local-customer', { successRedirect: '/', failureRedirect: '/' }),
);

export default router;