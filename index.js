const express = require('express')
var session = require('express-session');
const bodyParser = require('body-parser')
var path = require('path');
const router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

const app = express()
const port = 3000

const { Client } = require('pg');
const connectionString = 'postgres://medusr:med123@localhost:5432/medicinedb';
const client = new Client({
    connectionString: connectionString
});
client.connect();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/logout', function(request, response) {
	response.sendFile(path.join(__dirname + '/logout.html'));
});

app.post('/user-auth', function(request, response) {
	var uid = request.body.username;
	var password = request.body.password;
	if (uid && password) {
		client.query('SELECT * FROM users WHERE uid = $1 AND password = $2', [uid, password], function(error, results, fields) {
			console.log(results);
			console.log("resultset length="+results.rows.length);
			if (results.rows.length > 0) {
				request.session.loggedin = true;
				request.session.uid = results.rows[0].uid;
				request.session.name = results.rows[0].name;
				request.session.userimage = results.rows[0].image;
				response.redirect('/user-home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.get('/user-home', function(request, response) {
	if (request.session.uid) {
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write('<img src="/images/nodejs-logo.png" alt="nodejs logo">');
		response.write('<b>Welcome, ' + request.session.name + '!</b>');
response.write("<a href='/logout'>Logout</a>");
		response.write('<img src=/users_image/'+request.session.userimage+'>');			
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/signup', function(request, response) {
	response.sendFile(path.join(__dirname + '/signup.html'));
});

app.post('/user-signup', function(request, response) {
	var fileFlag=0, dbFlag=0;
	var form = new formidable.IncomingForm();
    	form.parse(request, function (err, fields, files) {
      		var oldpath = files.image.path;
      		var newpath = '/home/pramoj/nodejs-projects/medicine-project/public/users_image/' + files.image.name;


// Read the file
        fs.readFile(oldpath, function (err, data) {
            if (err) throw err;
            console.log('File read!');

            // Write the file
            fs.writeFile(newpath, data, function (err) {
                if (err) throw err;
                console.log('File uploaded and moved!');
                //response.end();
                console.log('File written!');
            });

            // Delete the file
            fs.unlink(oldpath, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            });
        });

     // fs.rename(oldpath, newpath, function (err) {
      //  if (err) throw err;
	//fileFlag=1;      
        
     // });//fs.rename end
	  	

			
var uid=fields.uid; 
var password=fields.password; 
var name=fields.name; 
var email=fields.email; 
var image=files.image.name;

client.query("INSERT INTO users(uid, password, name, email, image) values($1,$2,$3,$4,$5)", [uid, password, name, email, image], function(err, result) {
console.log("My result="+result);
console.log("My result count="+result.rowCount);
if (err) throw err;
console.log("before result count check");
if(result.rowCount >0){
	dbFlag=1;
	console.log("before redirect to login");
	response.redirect('/login');
			} else {
				response.send('some error occured!');
			}			
			response.end();
	});//client.query end
	
//console.log("Flags val="+fileFlag +"     "+dbFlag);	
});//form.parse end


});

app.get('/medicine-insert', function(request, response) {
	response.sendFile(path.join(__dirname + '/medicine_insert.html'));
});

app.post('/medicine-insert', function(request, response) {
	var medicine_id  = request.body.medicine_id;
	var batch_no     = request.body.batch_no;
	var medicine_name = request.body.medicine_name;
	var mrp		  =request.body.mrp;
	var base_price    =request.body.base_price;

        var mfg_date      =request.body.mfg_date;
console.log("mfg="+mfg_date);
        var expire_date   =request.body.expire_date;
console.log("expire="+request.body.expire_date);        
	
const sql="INSERT INTO medicine (medicine_id,batch_no,medicine_name, mrp, base_price, mfg_date, expire_date) VALUES ($1, $2, $3, $4, $5, $6, $7)";

	client.query(sql, [medicine_id, batch_no, medicine_name, mrp, base_price, mfg_date, expire_date],
 function(err, result) {
			console.log(result);			
			if (err) throw err;
			if(result.rowCount >0){				
				response.send('Medicine inserted');
			}else{
				response.send('Error occured');
			}			
			response.end();
		});
	
});


app.get('/medicine-search', function(request, response){
    response.sendFile(path.join(__dirname + '/medicine-search.html'));
});
app.post('/medicine-search', function(request, response){
//console.log("inside ms");
	var medicine_id = request.body.medicine_id;
//console.log("medicine_id="+medicine_id);
    	const sql="SELECT * FROM medicine WHERE medicine_id = $1";

	client.query(sql, [medicine_id], function(err, result) {
			//console.log("MS="+JSON.stringify(result));			
			if (err) throw err;
			if(result.rowCount >0){	
			//console.log("Medicine searched="+result.rowCount);
				response.send(result.rows);
			}else{
				response.send('Error occured');
			}			
			response.end();
		});
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});

