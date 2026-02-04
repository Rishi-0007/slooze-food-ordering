'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import { ORDERS_QUERY, CANCEL_ORDER_MUTATION, CHECKOUT_MUTATION, PAYMENT_METHODS_QUERY } from '@/lib/graphql';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    restaurant: {
      country: {
        currency: string;
      };
    };
  };
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
  user: {
    name: string;
    email: string;
  };
}

interface PaymentMethod {
  id: string;
  type: string;
  details: string;
}

interface OrdersData {
  orders: Order[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data, loading, error } = useQuery<OrdersData>(ORDERS_QUERY, { skip: !user });
  const { data: paymentData } = useQuery<{ paymentMethods: PaymentMethod[] }>(PAYMENT_METHODS_QUERY, {
    skip: !user || user.role === 'MEMBER',
  });

  const [cancelOrder] = useMutation(CANCEL_ORDER_MUTATION, {
    refetchQueries: [{ query: ORDERS_QUERY }],
  });

  const [checkout] = useMutation(CHECKOUT_MUTATION, {
    refetchQueries: [{ query: ORDERS_QUERY }],
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [dummyDetails, setDummyDetails] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const getOrderTotals = (items: OrderItem[]) => {
    const totals: Record<string, number> = {};
    items.forEach((item) => {
      const currency = item.menuItem.restaurant?.country?.currency || 'USD';
      totals[currency] = (totals[currency] || 0) + item.price * item.quantity;
    });
    return totals;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleCancel = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder({ variables: { orderId } });
      } catch (err) {
        console.error('Failed to cancel:', err);
        alert('Failed to cancel order');
      }
    }
  };

  const handleCheckoutClick = (order: Order) => {
    setSelectedOrder(order);
    if (paymentData?.paymentMethods?.length) {
      setSelectedMethodId(paymentData.paymentMethods[0].id);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!selectedOrder || !selectedMethodId) return;

    try {
      await checkout({
        variables: { input: { orderId: selectedOrder.id, paymentMethodId: selectedMethodId } },
      });
      setSelectedOrder(null);
      setDummyDetails('');
    } catch (err) {
      console.error('Failed to checkout:', err);
      alert('Failed to checkout order');
    }
  };

  if (authLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  const orders: Order[] = data?.orders || []; // Removed filter to show CART if needed, but backend filters usually. Actually show pending/confirmed
  const canManage = user.role === 'ADMIN' || user.role === 'MANAGER';

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
                    <span className="price">
                      {Object.entries(getOrderTotals(order.items)).map(([currency, amount], index, arr) => (
                        <span key={currency}>
                          {formatCurrency(amount, currency)}
                          {index < arr.length - 1 ? ' + ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.menuItem.name} ({formatCurrency(item.price * item.quantity, item.menuItem.restaurant?.country?.currency || 'USD')})
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    <strong>Ordered by:</strong> {order.user?.name || 'Unknown'} ({order.user?.email || 'No Email'})
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {canManage && order.status === 'PENDING' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleCheckoutClick(order)}
                      >
                        Checkout
                      </button>
                    )}

                    {canManage && (order.status === 'CONFIRMED' || order.status === 'PENDING') && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  {!canManage && order.status !== 'CANCELLED' && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Waiting for Manager confirmation
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div className="modal-content" style={{
              backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', minWidth: '400px'
            }}>
              <h2 style={{ marginBottom: '1rem' }}>Checkout & Pay</h2>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Total:</strong>
                {Object.entries(getOrderTotals(selectedOrder.items)).map(([currency, amount], index, arr) => (
                  <span key={currency} style={{ marginLeft: '0.5rem' }}>
                    {formatCurrency(amount, currency)}
                    {index < arr.length - 1 ? ' + ' : ''}
                  </span>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Method (Select from available options)</label>
                <select
                  className="form-input"
                  style={{ width: '100%' }}
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                >
                  <option value="">Select Payment Method</option>
                  {paymentData?.paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.type} - {pm.details}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Payment Details (Test Mode)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="Enter dummy card number or UPI ID"
                  value={dummyDetails}
                  onChange={(e) => setDummyDetails(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setSelectedOrder(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmCheckout}
                  disabled={!selectedMethodId}
                >
                  Pay & Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
