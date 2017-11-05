import express from 'express';
import HttpError from './errors';

const router = express.Router();

router.get('/', (req, res) => {
  throw new BadRequestError('nooo');
});

// Error Handler
router.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: err.message });
  }
});

export default router;
