const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support');

router.post('/', supportController.createRequest);

module.exports = router;