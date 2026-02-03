'use client';

import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import { RESTAURANTS_QUERY } from '@/lib/graphql';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface RestaurantsData {
  restaurants: Restaurant[];
}

export default function RestaurantsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading, error } = useQuery<RestaurantsData>(RESTAURANTS_QUERY, {
    skip: !user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Restaurants</h1>
          <p className="page-subtitle">
            {user.country ? `Showing restaurants in ${user.country.name}` : 'Showing all restaurants'}
          </p>
        </div>

        {loading && <div className="loading">Loading restaurants...</div>}
        {error && <div className="error-message">{error.message}</div>}

        <div className="grid grid-3">
          {data?.restaurants?.map((restaurant: Restaurant) => (
            <Link href={`/restaurant/${restaurant.id}`} key={restaurant.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <Image
                    src={restaurant.imageUrl || '/placeholder.jpg'}
                    alt={restaurant.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="card-image"
                  />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{restaurant.name}</h3>
                  <p className="card-text">{restaurant.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {data?.restaurants?.length === 0 && (
          <div className="empty-state">No restaurants available in your region.</div>
        )}
      </main>
    </>
  );
}
