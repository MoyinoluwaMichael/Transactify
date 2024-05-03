const express = require("express");
const sequelize = require("./db/sequelize");
const app = express();
const port = 3000;

const transactionsRouter = require("./routes/transactions")

app.use(express.json());

app.use('/api/v1/transactions', transactionsRouter);


sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synchronized");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });
