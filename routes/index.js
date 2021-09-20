const util = require('util');
const circularJSON = require('circular-json');
const { requiresAuth } = require('express-openid-connect');
const express = require('express');
const router = express.Router();
const tmdbDAO = require("../dao/tmdbDAO.js");

console.log(tmdbDAO);
// req.isAuthenticated is provided from the auth router
router.get('/', (req, res) => {
  console.log(req.oidc.user);
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

module.exports = router;
