const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const reportsRouter = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", reportsRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Node server running on port ${PORT}`);
});
