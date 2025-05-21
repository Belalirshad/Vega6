const express = require("express");
const multer = require("multer");
const Blog = require("../models/Blog");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/blogs/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// create blog
router.post("/", upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null; // image required

  // console.log(title, description, image, "------");

  if (!title || !description || !image) {
    return res
      .status(400)
      .send("Please provide all fields: title, description, image.");
  }

  try {
    const blog = new Blog({
      title,
      description,
      image,
    });

    await blog.save();
    res.status(201).json({ message: "Blog created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

// read blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find();
    // console.log(`Blogs: ${blogs}`);
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

// update blog
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).send("Blog not found.");
    }

    // update blog fields
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.image = image || blog.image;

    await blog.save();
    res.json({ message: "Blog updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

// delete blog
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).send("Blog not found.");
    }
    res.json({ message: "Blog deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

module.exports = router;
