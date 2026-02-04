'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import { CART_QUERY, UPDATE_CART_ITEM_MUTATION, PLACE_ORDER_MUTATION, PAYMENT_METHODS_QUERY, ORDERS_QUERY } from '@/lib/graphql';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    restaurant: {
      country: {
        currency: string;
      };
    };
  };
}



interface PaymentMethod {
  id: string;
  type: string;
  details: string;
}

interface CartData {
  cart: {
    id: string;
    totalPrice: number;
    items: CartItem[];
  } | null;
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkoutError, setCheckoutError] = useState('');

  const { data: cartData, loading: cartLoading } = useQuery<CartData>(CART_QUERY, { skip: !user });
  const { data: paymentData } = useQuery<{ paymentMethods: PaymentMethod[] }>(PAYMENT_METHODS_QUERY, {
    skip: !user,
  });

  const [updateCartItem] = useMutation(UPDATE_CART_ITEM_MUTATION, {
    refetchQueries: [{ query: CART_QUERY }],
  });

  const [placeOrder, { loading: placeOrderLoading }] = useMutation(PLACE_ORDER_MUTATION, {
    refetchQueries: [{ query: CART_QUERY }, { query: ORDERS_QUERY }],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleUpdateQuantity = async (orderItemId: string, quantity: number) => {
    await updateCartItem({ variables: { input: { orderItemId, quantity } } });
  };

  const getCartTotals = (items: CartItem[]) => {
    const totals: Record<string, number> = {};
    items.forEach((item) => {
      const currency = item.menuItem.restaurant.country.currency;
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

  const handlePlaceOrder = async () => {
    setCheckoutError('');
    try {
      if (!cart) return;
      await placeOrder({
        variables: { orderId: cart.id },
      });
      router.push('/orders');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
      setCheckoutError(errorMessage);
    }
  };

  if (authLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  const cart = cartData?.cart;
  const items: CartItem[] = cart?.items || [];
  const canCheckout = user.role === 'ADMIN' || user.role === 'MANAGER';

  return (
    <>
      <Header />
      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Your Cart</h1>
        </div>

        {cartLoading && <div className="loading">Loading cart...</div>}

        <div className="card">
          <div className="card-body">
            {items.length === 0 ? (
              <div className="empty-state">Your cart is empty</div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <strong>{item.menuItem.name}</strong>
                      <p className="card-text">
                        {new Intl.NumberFormat(
                          item.menuItem.restaurant?.country?.currency === 'INR' ? 'en-IN' : 'en-US',
                          {
                            style: 'currency',
                            currency: item.menuItem.restaurant?.country?.currency || 'USD',
                          }
                        ).format(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="quantity-controls">
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                ))}

                <div className="cart-total">
                  <span>Total</span>
                  <span className="price">
                    {Object.entries(getCartTotals(items)).map(([currency, amount], index, arr) => (
                        <span key={currency}>
                          {formatCurrency(amount, currency)}
                          {index < arr.length - 1 ? ' + ' : ''}
                        </span>
                      ))}
                  </span>
                </div>

                {checkoutError && <div className="error-message">{checkoutError}</div>}

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handlePlaceOrder}
                  disabled={placeOrderLoading || items.length === 0}
                >
                  {placeOrderLoading ? 'Processing...' : 'Place Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
