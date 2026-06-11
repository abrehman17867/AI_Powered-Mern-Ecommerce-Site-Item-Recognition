const app = require(".");
const { connectDb } = require("./config/db");
require("dotenv").config();

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log("ecommerce api listening on PORT", port);
    });
  } catch {
    process.exit(1);
  }
}

start();
