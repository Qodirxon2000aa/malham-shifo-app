import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://clinic-backend-zeta.vercel.app/employee');
      const employees = await response.json();

      const employee = employees.find(emp => 
        emp.login === username && emp.password === password
      );

      if (employee) {
        localStorage.setItem('userData', JSON.stringify(employee));
        localStorage.setItem('isLoggedIn', 'true');
        toast.success('Kirildi!');
        setTimeout(() => navigate('/dashboard'), 1000); // Delay for toast visibility
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Parolni tiklash uchun klinika mamuriga murojaat qiling.');
  };

  return (
    <div className="login-mobile">
      <Toaster />
      
      <div className="login-header">
        <h1>MALHAM SHIFO</h1>
      </div>
      
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="welcome-message">Ishchilar uchun maxsus dastur</div>
          
          <div className="logo-container">
            <div className="logo">MSH</div> {/* Initials for Malham Shifo */}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="LOGIN"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="PAROL"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="forgot-password">
            <a href="#" onClick={handleForgotPassword}>Parol esdan chiqdimi?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;