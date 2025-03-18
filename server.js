const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/login",require("./routes/login"));
app.use("/farmers", require("./routes/farmers"));
app.use("/orders", require("./routes/orders"));
app.use("/buyers", require("./routes/buyers"));
app.use("/sales", require("./routes/sales"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
