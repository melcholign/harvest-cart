import express from 'express';

const router = express.Router();

router.post('/create', (req, res) => {
    res.send('Customer account data will be posted to this route');
});

export default router;