var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var fileUpload = require("express-fileupload")
var fs = require('fs')

var config = require('./config')
var ai = require('./ai.js')

var token_number = 1;

app.use(bodyParser.urlencoded({
		extended: true
}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/static', express.static('public'));

app.get('/', function(req, res) {
	res.sendFile('index.html', {root: __dirname });
});

app.post('/api/fileupload',  (req, res) => {
	user_token = token_number
	token_number += 1;
	file_count = 1;
	console.log(req.body);
	if (req.files == null) {
		res.json({status: 'ERROR', data : {}});
	}
	else {

		var files = req.files.userDocument;
		
		if (!fs.existsSync(__dirname+'/tmp/token_'+user_token+'/')) {
			fs.mkdirSync(__dirname+'/tmp/token_'+user_token+'/');
		}

		if (files instanceof Array) { // multiple files
			
			var store_files_promise = []


			for (i in files) {
				var p = new Promise((resolve, reject) => {
					var file = files[i];
					file.mv(__dirname+'/tmp/token_'+user_token+'/'+file_count+'.txt', (err) => {
						if (err) {
							reject('error');
						} else {
							resolve('done');
						} 
					});
				});
				file_count += 1;
				store_files_promise.push(p);
			}

			Promise.all(store_files_promise).then((mssgs) => {
				var watson_processing = new Promise((resolve, reject) => {
					ai.process_token('token_'+user_token, resolve, reject);	
				});
				watson_processing.then((watson_data) => {
					res.json({status: 'SUCCESS', data : watson_data});
				}).catch((reason) => {
					res.json({status: 'ERROR', data: {}});
				});
				
			}).catch((err) => {
				res.json({status: 'ERROR', data : {}});
			});
			
		} else { // Single file
			files.mv(__dirname+'/tmp/token_'+user_token+'/'+file_count+'.txt', (err) => {
				if (err) {
					res.json({status: 'ERROR', data : {}});
				} else {
					var watson_processing = new Promise((resolve, reject) => {
						ai.process_token('token_'+user_token, resolve, reject);	
					});
					watson_processing.then((watson_data) => {
						res.json({status: 'SUCCESS', data : watson_data});
					}).catch((reason) => {
						res.json({status: 'ERROR', data: {}});
					});
				}
			});
			file_count += 1;
		}

	}
});


app.listen(config['PORT'], function () {
	console.log('Example app listening on port 3000!');
})