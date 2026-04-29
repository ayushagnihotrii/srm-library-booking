import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: '0 0 16px 16px', borderTop: 'none' }}>
      <div className="container flex items-center justify-between" style={{ padding: '1rem' }}>
        <Link to="/" className="flex items-center" style={{ gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.25rem' }}>
          <BookOpen color="var(--accent-primary)" />
          SRM AP Library
        </Link>

        <div className="flex items-center" style={{ gap: '1rem' }}>
          <button onClick={toggleTheme} className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-secondary)' }} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div className="flex items-center" style={{ gap: '1rem' }}>
              <div className="flex items-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <UserIcon size={18} />
                <span style={{ fontWeight: '500' }}>{user.name}</span>
                {user.role === 'admin' && <span style={{ fontSize: '0.75rem', background: 'var(--accent-primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Admin</span>}
              </div>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center" style={{ gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
