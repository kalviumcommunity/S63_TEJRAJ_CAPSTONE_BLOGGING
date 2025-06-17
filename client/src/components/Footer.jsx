import React from 'react';

const Footer = () => {
  return (
    <div className='text-sm text-center bg-gray-50 py-3'>
      <p>&copy; 2025 MyBlog. All rights reserved.</p>
    </div>
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
