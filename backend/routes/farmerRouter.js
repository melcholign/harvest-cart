const express = require('express');
const farmerController = require('../controllers/farmerController');
const authMiddleware = require('../middleware/authMiddleware');   

const router = express.Router();

// Public routes
router.post('/register', farmerController.registerFarmer);
router.post('/login', farmerController.loginFarmer);

// Protected routes   
router.get('/:farmerID', authMiddleware, farmerController.getFarmerProfile);
router.put('/:farmerID/update', authMiddleware, userController.updateUserProfile);
router.post('/:farmerID/store', authMiddleware, userController.addToCart);
router.delete('/:farmerID/delete', authMiddleware, userController.removeFromCart);

module.exports = router;