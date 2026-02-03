'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LOGIN_MUTATION } from '@/lib/graphql';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data } = await loginMutation({
        variables: { loginInput: { email, password } },
      });
      
      if (data?.login) {
        login(data.login.accessToken, data.login.user);
        router.push('/restaurants');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🍕 Slooze Food</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nick.fury@shield.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '0.5rem' }}><strong>Test Accounts (password: password123)</strong></p>
          <p>Admin: nick.fury@shield.com</p>
          <p>Manager (IN): captain.marvel@shield.com</p>
          <p>Manager (US): captain.america@shield.com</p>
          <p>Member (IN): thor@shield.com</p>
          <p>Member (US): travis@shield.com</p>
        </div>
      </div>
    </div>
  );
}
