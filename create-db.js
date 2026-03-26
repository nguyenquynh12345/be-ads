const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '139.162.50.38',
  user: 'root',
  password: '123456',
  port: 3306
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the server:', err.message);
    process.exit(1);
  }
  
  console.log('Connected to server. Creating database...');
  connection.query('CREATE DATABASE IF NOT EXISTS mydb', (err, results) => {
    if (err) {
      console.error('Error creating database:', err.message);
      process.exit(1);
    }
    console.log('Database "mydb" created or already exists!');
    process.exit(0);
  });
});
