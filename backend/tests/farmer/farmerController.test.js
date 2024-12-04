import { jest } from '@jest/globals';
import { pool } from '../../db/pool.js';
import { FarmerController } from '../../controllers/farmer-controller.js';
import { executeQueries } from './test-functions.js';
import fs, { existsSync } from 'fs';


test('Registering new farmer account into the database after performing input validation', async () => {
  const connection = await pool.getConnection();


  // Retrieve AUTO_INCREMENT value for farmer table
  let results = await connection.query(
    `SELECT AUTO_INCREMENT
     FROM  INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = 'cse327_project'
     AND   TABLE_NAME   = 'farmer';`);

  console.log(results);
  const nextFarmerId = results[0].AUTO_INCREMENT;
  
  // mock request and response
  const req = {
    body: { 
      firstname : 'Test',
      lastname: 'Farmer',
      gender: 'other',
      dob: '2000-01-01',
      mobile: '01211111111',
      address: 'Sec#1, Rd#1, Hs#1',
      email: 'test.farmer@test.com',
      password: 'safee123'
    },
    uniqueFarmerFolderName : 'test-farmer'
  };

  const res = {
    redirect: jest.fn().mockReturnThis()
  };

  //Test the controller
  await FarmerController.register(req, res);

  //retrieve the farmer that was just registered to verify the information is all correct
  results = await connection.query(
    `SELECT *
     FROM  farmer
     WHERE farmerId = ${nextFarmerId};`);

  farmer = results[0];

  //Verify the response
  expect(res.redirect).toHaveBeenCalledWith('/farmer/login');

  //Verify the farmer's information exists in database
  expect(farmer).toBe({
    farmerId: nextFarmerId,
    firstname : 'Test',
    lastname: 'Farmer',
    gender: 'other',
    dob: new Date('2000-01-01').toISOString(),
    mobile: '01211111111',
    address: 'Sec#1, Rd#1, Hs#1',
    nidImgPath: 'src/farmer/' + req.uniqueFarmerFolderName + 'nid.jpg',
    pfpImgPath: 'src/farmer/' + req.uniqueFarmerFolderName + 'pfp.jpg',
    email: 'test.farmer@test.com',
    passHash: '$2a$10$5goTEE9qnD/7ewbL4C3TquApUmlFL0Jdwrh.sgIeYZVvnwJh8YWTe',
    dateCreated: farmer.dateCreated,
    dateUpdated: farmer.dateUpdated
})

  // ensure a directory have been created to store the new farmer's images
  expect(fs.existsSync(farmer.nidImgPath.replace('nid.jpg',''))).tobe(true);

  // remove mock data
  await connection.query(
    `
    DELETE FROM farmer
    WHERE farmerId = '${farmer.farmerId}';
    `
  )

  await connection.release();
})



test('Updating a farmer information already stored within the database', async () => {
  const connection = await pool.getConnection();

  let results = await connection.query(
    `
    INSERT INTO TABLE farmer
    VALUES 
    (
      '10000',
      'Test',
      'Farmer',
      'male',
      '2000-01-01',
      '01211111111',
      'Sec#1, Rd#1, Hs#1',
      'src/farmer/test-farmer/nid.jpg',
      'src/farmer/test-farmer/pfp.jpg',
      'test.farmer@test.com',
      '$2a$10$5goTEE9qnD/7ewbL4C3TquApUmlFL0Jdwrh.sgIeYZV',
      '2024-12-02',
      '2024-12-02'
    );
    `
  );

  // mock request and response
  const req = {
    body: { 
      firstname : 'edited',
      lastname: 'edited',
      gender: 'other',
      dob: '2999-12-31',
      mobile: 'edited',
      address: 'edited',
      email: 'edited@edited.com',
      password: 'safee123'
    },
    user: {
      farmerId: 10000
    }
  };

  const res = {
    redirect: jest.fn().mockReturnThis()
  };

  //Test the controller
  await FarmerController.update(req, res);

  //retrieve the farmer that was just registered to verify the information is all correct
  results = await connection.query(
    `SELECT *
     FROM  farmer
     WHERE farmerId = ${req.user.farmerId};`);

  farmer = results[0];

  //Verify the response
  expect(res.redirect).toHaveBeenCalledWith('/farmer');

  //Verify the farmer's information exists in database
  expect(farmer).toBe({
    farmerId: req.user.farmerId,
    firstname : 'edited',
    lastname: 'edited',
    gender: 'other',
    dob: new Date('2999-12-31').toISOString(),
    mobile: 'edited',
    address: 'edited',
    nidImgPath: farmer.nidImgPath,
    pfpImgPath: farmer.pfpImgPath,
    email: 'edited@edited.com',
    passHash: '$2a$10$5goTEE9qnD/7ewbL4C3TquApUmlFL0Jdwrh.sgIeYZVvnwJh8YWTe',
    dateCreated: farmer.dateCreated,
    dateUpdated: farmer.dateUpdated
  })

  // remove mock data
  await connection.query(
    `
    DELETE FROM farmer
    WHERE farmerId = '${farmer.farmerId}';
    `
  )

  await connection.release();
})



test('Removing a farmer tuple from the database', async() => {
  const connection = await pool.getConnection();

  let results = await connection.query(
    `
    INSERT INTO TABLE farmer
    VALUES 
    (
      '10000',
      'Test',
      'Farmer',
      'male',
      '2000-01-01',
      '01211111111',
      'Sec#1, Rd#1, Hs#1',
      'src/farmer/test-farmer/nid.jpg',
      'src/farmer/test-farmer/pfp.jpg',
      'test.farmer@test.com',
      '$2a$10$5goTEE9qnD/7ewbL4C3TquApUmlFL0Jdwrh.sgIeYZV',
      '2024-12-02',
      '2024-12-02'
    ),
    (
      '10001',
      'Test 2',
      'Farmer 2',
      'female',
      '2001-02-02',
      '01322222222',
      'Sec#2, Rd#2, Hs#2',
      'src/farmer/test-farmer-2/nid.jpg',
      'src/farmer/test-farmer-2/pfp.jpg',
      'test2.farmer2@test2.com',
      '$2a$10$5goTEE9qnD/7ewbL4C3TquApUmlFL0Jdwrh.sgIeYZV',
      '2024-12-02',
      '2024-12-02'
    )
    `
  );


  const req = {
    user: {
      farmerId: 10000
    }
  };
  const res = {
    redirect: jest.fn().mockReturnThis()
  }
  await FarmerController.delete(req, res);

  //Verify the response
  expect(res.redirect).toHaveBeenCalledWith('/farmer/register');


  results = connection.query(
    `
    SELECT *
    FROM farmer
    WHERE farmerId = 10000
    `
  )
  deletedFarmer = results[0];

  results = connection.query(
    `
    SELECT *
    FROM farmer
    WHERE farmerId = 10001
    `
  )
  existingFarmer = results[0];

  // ensure deleted account does not exist
  expect(deletedFarmer).toBe(false);
  expect(existingFarmer).toBe(true);
  
  await connection.release()

})