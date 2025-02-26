pabitra@pabitra-VirtualBox:~$ sudo su postgres

You are connected to database "postgres" as user "postgres" via socket in "/var/run/postgresql" at port "5432".


CREATE ROLE medusr WITH LOGIN PASSWORD 'med123';
ALTER ROLE medusr CREATEDB;

//check the postgres version
$ psql -V
//exit to root
postgres@pabitra-VirtualBox:/etc/postgresql/10/main$ exit
# gedit pg_hba.conf
change peer to md5
# service postgresql restart
root@pabitra-VirtualBox:~# sudo su postgres
postgres@pabitra-VirtualBox:/root$ psql -d postgres -U medusr
postgres=>
postgres=> CREATE DATABASE medicinedb;
postgres=> \c medicinedb

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(30) UNIQUE,
  password VARCHAR(30),
  name VARCHAR(30),
  email VARCHAR(30),  
  image VARCHAR(255),
  reg_date DATE NOT NULL DEFAULT CURRENT_DATE
);
INSERT INTO users (uid, password, name, email, image)
VALUES ('pghanta', 'pg123', 'Pramoj G', 'pg@abc.com', 'pg.jpg');

medicinedb=> select * from users;

CREATE TABLE medicine (
  id SERIAL PRIMARY KEY,
  medicine_id VARCHAR(30) UNIQUE,
  medicine_name VARCHAR(30),
  batch_no VARCHAR(30),    
  mrp real,
  base_price real,
  mfg_date DATE,  
  expire_date DATE,   
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE
  );
INSERT INTO medicine (medicine_id,medicine_name,batch_no, mrp, base_price, mfg_date,expire_date)
VALUES ('s123', 'moreasy', 'rs:200',506.00, 480, '2020-08-28', '2020-12-28');

'INSERT INTO medicine (medicine_id, medicine_name,batch_no, mrp, base_price, mfg_date, expire_date) VALUES ($1, $2, $3, $4, $5, $6,$7)', [medicine_id, medicine_name,batch_no, mrp, base_price, mfg_date, expire_date]


