const app = require(".");
const { connectDb } = require("./config/db");
require('dotenv').config()

const port = process.env.PORT;
app.listen(port, async () => {
  await connectDb();
  console.log("ecommerce api listing on PORT", port);
});
