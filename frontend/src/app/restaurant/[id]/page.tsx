'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/lib/auth-context';
import { RESTAURANT_QUERY, ADD_TO_CART_MUTATION, CART_QUERY } from '@/lib/graphql';
import Header from '@/components/Header';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function RestaurantPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const { data, loading, error } = useQuery(RESTAURANT_QUERY, {
    variables: { id },
    skip: !user || !id,
  });

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    refetchQueries: [{ query: CART_QUERY }],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAddToCart = async (menuItemId: string) => {
    try {
      await addToCart({
        variables: { input: { menuItemId, quantity: 1 } },
      });
      setAddedItems((prev) => new Set(prev).add(menuItemId));
      setTimeout(() => {
        setAddedItems((prev) => {
          const next = new Set(prev);
          next.delete(menuItemId);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  if (authLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  const restaurant = data?.restaurant;
  const menuItems = data?.menuItems || [];

  return (
    <>
      <Header />
      <main className="container">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error-message">{error.message}</div>}

        {restaurant && (
          <>
            <div className="page-header">
              <h1 className="page-title">{restaurant.name}</h1>
              <p className="page-subtitle">{restaurant.description}</p>
            </div>

            <div className="grid grid-2">
              {menuItems.map((item: MenuItem) => (
                <div key={item.id} className="card">
                  <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 className="card-title">{item.name}</h3>
                      <p className="card-text">{item.description}</p>
                      <p className="price" style={{ marginTop: '0.5rem' }}>
                        {typeof item.price === 'number' && item.price > 100 ? '₹' : '$'}{item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      className={`btn ${addedItems.has(item.id) ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleAddToCart(item.id)}
                      disabled={addedItems.has(item.id)}
                    >
                      {addedItems.has(item.id) ? 'Added ✓' : 'Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {menuItems.length === 0 && (
              <div className="empty-state">No menu items available.</div>
            )}
          </>
        )}

        {!loading && !restaurant && (
          <div className="empty-state">Restaurant not found or not accessible.</div>
        )}
      </main>
    </>
  );
}
