import React from 'react';
import AuthPage from './components/AuthPage';

import LandingPage from './components/LandingPage';

const App = () => {
  return (
    <div>
      
       <LandingPage />
       <Route path="/auth" element={<AuthPage />} />

    </div>
    
    
  );
};

export default App;
           