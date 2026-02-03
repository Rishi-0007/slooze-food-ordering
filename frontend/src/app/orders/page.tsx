'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import { ORDERS_QUERY, CANCEL_ORDER_MUTATION } from '@/lib/graphql';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: { name: string };
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersData {
  orders: Order[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data, loading, error } = useQuery<OrdersData>(ORDERS_QUERY, { skip: !user });
  const [cancelOrder] = useMutation(CANCEL_ORDER_MUTATION, {
    refetchQueries: [{ query: ORDERS_QUERY }],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleCancel = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder({ variables: { orderId } });
      } catch (err) {
        console.error('Failed to cancel:', err);
      }
    }
  };

  if (authLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  const orders: Order[] = data?.orders?.filter((o: Order) => o.status !== 'CART') || [];
  const canCancel = user.role === 'ADMIN' || user.role === 'MANAGER';

  return (
    <>
      <Header />
      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Your Orders</h1>
        </div>

        {loading && <div className="loading">Loading orders...</div>}
        {error && <div className="error-message">{error.message}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">No orders yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="price">${order.totalPrice.toFixed(2)}</span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {order.items.map((item) => (
                      <div key={item.id}>{item.quantity}x {item.menuItem.name}</div>
                    ))}
                  </div>

                  {canCancel && (order.status === 'CONFIRMED' || order.status === 'PENDING') && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ marginTop: '1rem' }}
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}

                  {!canCancel && order.status !== 'CANCELLED' && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Only Managers/Admins can cancel orders
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
