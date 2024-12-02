import { StoreController } from '../../controllers/storeController.js'
import { jest } from '@jest/globals';
import { pool } from '../../db/pool.js';
import { executeQueries } from './test-functions.js';
import { BasketController } from '../../controllers/basket-controller.js';

test('Retrieving valid basket, with information on its changes', async () => {
  const connection = await pool.getConnection();

  // Insert mock data
  await executeQueries(connection, [
    `INSERT into farmer (farmerId, firstname, lastname, gender, dob, mobile, address, nidImgPath, pfpImgPath, email, passHash)
         VALUES ('1000', 'Mr', 'A', 'male', '2000-02-20', '01711111111', 'address A', 'src/farmer/1000/nid.jpg', 'src/farmer/1000/pfp.jpg', 'mra@gmail.com', 'e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4'),
                ('1001', 'Mrs', 'B', 'female', '1999-09-19', '01911888111', 'address B', 'src/farmer/1001/nid.jpg', 'src/farmer/1001/pfp.jpg', 'mrb@gmail.com', 'e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4'),
                ('1002', 'Mr', 'C', 'male', '2001-01-21', '01211222111', 'address C', 'src/farmer/1002/nid.jpg', 'src/farmer/1002/pfp.jpg', 'mrc@gmail.com', 'e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4')
    `,
    `
    INSERT INTO store (storeId, farmerId, storeName, description, galleryImgsPath, coverImgPath)
        VALUES ('2001', '1000', 'store A', 'description for store A', 'src/farmer/1000/store/2001/gallery/', 'src/farmer/1000/store/2001/cover.jpg'),
               ('2002', '1000', 'store B', 'description for store B', 'src/farmer/1000/store/2002/gallery/', 'src/farmer/1000/store/2002/cover.jpg'),
               ('2003', '1001', 'store 1', 'description for store 2001', 'src/farmer/1001/store/2003/gallery/', 'src/farmer/1001/store/2003/cover.jpg'),
               ('2004', '1002', 'store I', 'description for store I', 'src/farmer/1002/store/2004/gallery/', 'src/farmer/1002/store/2004/cover.jpg')
    `,
  ]);

  // Mock request and response
  const req = {
    user: { customerId: 1 },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  // Test the controller
  await BasketController.getBasket(req, res);

  // Verify the response
  expect(res.json).toHaveBeenCalledWith({
    basket: [
      {
        id: 1000,
        name: 'Egg',
        category: 'miscellaneous',
        quantity: 10,
        unitPrice: 15,
      },
    ],
    changes: [],
  });

  // Cleanup mock data
  await executeQueries(connection, [
    `DELETE FROM Basket WHERE customerId = 1`,
    `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1003`,
  ]);

  await connection.release();
});