var express = require('express');
var mysql = require('mysql');
var app = express();

//create mysql connection
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'BDUDBdev'
});

//connect to mysql connection
conn.connect(function (err) {
	if (err) {
		console.log('Error!');
	} else {
		console.log('Success!');
	}
});

app.get('/', function (req, res) {
	conn.query("SELECT * FROM Users WHERE Name = 'Hans'", function (err, rows, fields) {
		if (err) {
			console.log('Error in the query');
		} else {
			console.log('Successful query!\n');
			res.send('Hello ' + rows[0].Vorname + ' ' + rows[0].Name);
		}
		
	});
});

app.listen(1337);