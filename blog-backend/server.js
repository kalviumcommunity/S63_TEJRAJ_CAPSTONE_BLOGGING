const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req,res)=>{
    res.send('Welcome to Blog API!');

});
 
app.get('/api/blogs', (req,res)=>{
    const sampleBlogs = [
        {id:1, title: 'First Blog', content: 'Hello World'},
        {id:2, title: "Second Blog", content: "This is another post"}
    ];
    res.json(sampleBlogs);
});

app.listen(5000,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})
