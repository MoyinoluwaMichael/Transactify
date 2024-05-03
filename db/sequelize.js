const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();


module.exports = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
  );
  
