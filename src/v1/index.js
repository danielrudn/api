import express from 'express';
import HttpError from './errors';
import rooms from './controllers/room-controller';
import auth from './controllers/auth-controller';
import models from '../models';

const router = express.Router();

router.use('/rooms', rooms);
router.use('/auth', auth);

// Error Handler
router.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof models.Sequelize.ValidationError) {
    res.status(400).json({ error: err.errors[0].message });
  } else {
    res.status(500).json({ error: err.message });
  }
});

export default router;
