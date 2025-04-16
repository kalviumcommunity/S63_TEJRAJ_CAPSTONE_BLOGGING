const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json()); // Add this line to parse JSON bodies

let blogs = [
    {id: 1, title: 'First Blog', content: 'Hello World'},
    {id: 2, title: "Second Blog", content: "This is another post"}
];

app.get('/', (req, res) => {
    res.send('Welcome to Blog API!');
});

app.get('/api/blogs', (req, res) => {
    res.json(blogs);
});

app.post('/api/blogs/post', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and Content are required' });
    }

    const newBlog = {
        id: blogs.length + 1,
        title, content
    };
    blogs.push(newBlog);
    res.status(201).json(newBlog);
});

app.listen(5000, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
