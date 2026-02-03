'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleBadgeClass = {
    ADMIN: 'badge-admin',
    MANAGER: 'badge-manager',
    MEMBER: 'badge-member',
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/restaurants" className="logo">🍕 Slooze Food</Link>
        
        {user && (
          <>
            <nav className="nav">
              <Link href="/restaurants">Restaurants</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/orders">Orders</Link>
              {user.role === 'ADMIN' && (
                <Link href="/payment-methods">Payments</Link>
              )}
            </nav>
            
            <div className="user-info">
              <span>{user.name}</span>
              <span className={`badge ${roleBadgeClass[user.role]}`}>{user.role}</span>
              {user.country && <span className="badge">{user.country.code}</span>}
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
