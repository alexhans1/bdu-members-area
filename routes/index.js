const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	//console.log("request is " + req.user.username);
	res.render('index.ejs');
});

module.exports = router;
