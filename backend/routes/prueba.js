const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Prueba funcionando' });
});

router.get('/last-number', (req, res) => {
  res.json({ suggested: 'S001' });
});

module.exports = router;