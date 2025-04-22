import React from 'react';

const BlogCard = ({ title, content, author }) => {
  return (
    <div style={styles.card}>
      <h2>{title}</h2>
      <p>{content}</p>
      <small>By {author}</small>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ddd',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px'
  }
};

export default BlogCard;
