import { FarmerController } from '../controllers/farmer-controller.js';
import { FarmerModel } from '../models/farmerModel';
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import { jest } from '@jest/globals';
import { pool } from '../../db/pool.js';

jest.mock('../models/farmerModel');
jest.mock('bcryptjs');
jest.mock('fs');

let req, res, next;

beforeEach(() => {
  req = {
    body: {},
    params: {},
    user: {
      nidImgPath: 'user/nid.jpg',
      farmerId: 'farmer1'
    },
    uniqueFarmerFolderName: 'uniqueFarmerFolder'
  };
  res = {
    json: jest.fn().mockReturnValue(res),
    render: jest.fn().mockReturnValue(res),
    redirect: jest.fn().mockReturnValue(res),
    status: jest.fn().mockReturnValue(res),
    locals: {}
  };
  next = jest.fn();
});

describe('FarmerController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchByName', () => {
    it('should return search results when found', async () => {
      req.body = 'some farmer name';
      FarmerModel.searchByName.mockResolvedValue([{ id: 1, name: 'Farmer 1' }]);

      await FarmerController.searchByName(req, res);

      expect(FarmerModel.searchByName).toHaveBeenCalledWith('some farmer name');
      expect(res.json).toHaveBeenCalledWith({ searchResultList: [{ id: 1, name: 'Farmer 1' }] });
    });

    it('should return message when no farmers found', async () => {
      req.body = 'some farmer name';
      FarmerModel.searchByName.mockResolvedValue([]);

      await FarmerController.searchByName(req, res);

      expect(FarmerModel.searchByName).toHaveBeenCalledWith('some farmer name');
      expect(res.json).toHaveBeenCalledWith({ message: 'No farmers match your searched name.' });
    });

    it('should handle server error', async () => {
      req.body = 'some farmer name';
      FarmerModel.searchByName.mockRejectedValue(new Error('Server error'));

      await FarmerController.searchByName(req, res);

      expect(FarmerModel.searchByName).toHaveBeenCalledWith('some farmer name');
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('register', () => {
    it('should register a new farmer successfully', async () => {
      req.body = {
        firstname: 'New',
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'newfarmer@example.com',
        password: 'password'
      };
      const hashedPassword = 'hashedPassword';
      bcryptjs.hash.mockResolvedValue(hashedPassword);
      FarmerModel.register.mockResolvedValue();

      await FarmerController.register(req, res);

      expect(bcryptjs.hash).toHaveBeenCalledWith('password', 10);
      expect(FarmerModel.register).toHaveBeenCalledWith('New', 'Farmer', 'male', '1990-01-01', '0123456789', '123 Farm Lane', expect.any(String), expect.any(String), 'newfarmer@example.com', hashedPassword);
      expect(res.redirect).toHaveBeenCalledWith('/farmer/login');
    });

    it('should return message when required fields are missing', async () => {
      req.body = {
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'newfarmer@example.com',
        password: 'password'
      };

      await FarmerController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'All required input fields must be filled!' });
    });

    it('should handle duplicate entry error', async () => {
      req.body = {
        firstname: 'New',
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'newfarmer@example.com',
        password: 'password'
      };
      FarmerModel.register.mockRejectedValue({ code: 'ER_DUP_ENTRY', sqlMessage: "Duplicate entry 'newfarmer@example.com' for key 'email'" });

      await FarmerController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'The email enterred is in use by another account!' });
    });

    it('should handle server error', async () => {
      req.body = {
        firstname: 'New',
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'newfarmer@example.com',
        password: 'password'
      };
      FarmerModel.register.mockRejectedValue(new Error('Server Error'));

      await FarmerController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });

  describe('update', () => {
    it('should update a farmer successfully', async () => {
      req.body = {
        firstname: 'Updated',
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'updatedfarmer@example.com',
        password: 'newpassword'
      };
      req.user = { farmerId: 1 };
      const hashedPassword = 'newhashedPassword';
      bcryptjs.hash.mockResolvedValue(hashedPassword);
      FarmerModel.update.mockResolvedValue();

      await FarmerController.update(req, res);

      expect(bcryptjs.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(FarmerModel.update).toHaveBeenCalledWith('Updated', 'Farmer', 'male', '1990-01-01', '0123456789', '123 Farm Lane', 'updatedfarmer@example.com', hashedPassword, 1);
      expect(res.redirect).toHaveBeenCalledWith('/farmer');
    });

    it('should return message when required fields are missing', async () => {
      req.body = {
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'updatedfarmer@example.com'
      };
      req.user = { farmerId: 1 };

      await FarmerController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'All required input fields must be filled!' });
    });

    it('should handle duplicate entry error', async () => {
      req.body = {
        firstname: 'Updated',
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'updatedfarmer@example.com',
        password: 'newpassword'
      };
      req.user = { farmerId: 1 };
      FarmerModel.update.mockRejectedValue({ code: 'ER_DUP_ENTRY', sqlMessage: "Duplicate entry 'updatedfarmer@example.com' for key 'email'" });

      await FarmerController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'The email enterred is in use by another account!' });
    });

    it('should handle server error', async () => {
      req.body = {
        firstname: 'Updated',
        lastname: 'Farmer',
        gender: 'male',
        dob: '1990-01-01',
        mobile: '0123456789',
        address: '123 Farm Lane',
        email: 'updatedfarmer@example.com',
        password: 'newpassword'
      };
      req.user = { farmerId: 1 };
      FarmerModel.update.mockRejectedValue(new Error('Server Error'));

      await FarmerController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });

  describe('delete', () => {
    it('should delete a farmer successfully', async () => {
      req.user = {
        nidImgPath: 'path/to/nid.jpg',
        farmerId: 1
      };
      FarmerModel.delete.mockResolvedValue();

      await FarmerController.delete(req, res);

      expect(FarmerModel.delete).toHaveBeenCalledWith(1);
      expect(res.redirect).toHaveBeenCalledWith('/farmer/register');
    });

    it('should handle server error', async () => {
      req.user = {
        nidImgPath: 'path/to/nid.jpg',
        farmerId: 1
      };
      FarmerModel.delete.mockRejectedValue(new Error('Server Error'));

      await FarmerController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Server Error' });
    });
  });
});
