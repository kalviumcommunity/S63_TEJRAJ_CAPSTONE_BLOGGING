require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Models
const Blog = require('./models/Blog');  
const User = require('./models/User');  

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Blog API!');
});

// Get all blogs with author populated
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username email');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blogs', error: err.message });
  }
});

// Add new blog (expects author ID)
app.post('/api/blogs/post', async (req, res) => {
  const { title, content, image, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ message: 'Title, Content, and Author ID are required.' });
  }

  try {
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({ message: 'Author (user) not found.' });
    }

    const newBlog = new Blog({ title, content, image, author });
    const savedBlog = await newBlog.save();

    res.status(201).json(savedBlog);
  } catch (err) {
    res.status(500).json({ message: 'Error saving blog', error: err.message });
  }
});

// Update blog
app.put('/api/blogs/update', async (req, res) => {
  const { id, title, content } = req.body;

  if (!id || !title || !content) {
    return res.status(400).json({ message: 'ID, Title and Content are required.' });
  }

  try {
    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    res.status(200).json({
      message: `Blog with ID ${id} updated successfully.`,
      updatedBlog: blog
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating blog', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
