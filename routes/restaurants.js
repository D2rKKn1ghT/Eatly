const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurants');

router.get('/', restaurantsController.getAll);
router.get('/:id/menu', restaurantsController.getMenu);

module.exports = router;
router.get('/:id', (req, res, next) => {
  if (!req.params.id || isNaN(req.params.id)) {
    return res.status(400).json({ error: 'Invalid restaurant ID' });
  }
  next();
}, restaurantsController.getById);