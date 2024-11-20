import express from 'express';
import createCustomerValidator from '../validators/customer/customer-validator.js';
import { CustomerController } from '../controllers/customer-controller.js';

const router = express.Router();

router.post('/create', createCustomerValidator(), CustomerController.createCustomer);

export default router;