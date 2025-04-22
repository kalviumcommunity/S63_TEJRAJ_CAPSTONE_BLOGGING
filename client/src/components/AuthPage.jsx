import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useEffect } from 'react';

function AuthPage() {
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User:', result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '/'; // or navigate to home/dashboard
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-2xl mb-4">Login / Signup</h2>
      <button
        onClick={loginWithGoogle}
        className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default AuthPage;
