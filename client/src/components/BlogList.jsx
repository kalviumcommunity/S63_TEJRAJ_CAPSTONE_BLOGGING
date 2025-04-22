import React from 'react';
import BlogCard from './BlogCard';

const BlogList = () => {
  const blogs = [
    { id: 1, title: 'My First Blog', content: 'Hello World!', author: 'Tejraj' },
    { id: 2, title: 'React is Fun', content: 'Let’s learn React!', author: 'Kalvium' }
  ];

  return (
    <div>
      {blogs.map(blog => (
        <BlogCard
          key={blog.id}
          title={blog.title}
          content={blog.content}
          author={blog.author}
        />
      ))}
    </div>
  );
};

export default BlogList;
