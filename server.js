require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use("/", authRoutes);

app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
