import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; 2025 MyBlog. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: {
    textAlign: 'center',
    padding: '1rem',
    marginTop: '2rem',
    backgroundColor: '#f2f2f2'
  }
};

export default Footer;
