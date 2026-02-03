'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import { CART_QUERY, UPDATE_CART_ITEM_MUTATION, CHECKOUT_MUTATION, PAYMENT_METHODS_QUERY, ORDERS_QUERY } from '@/lib/graphql';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: { id: string; name: string };
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

  const [checkout, { loading: checkoutLoading }] = useMutation(CHECKOUT_MUTATION, {
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

  const handleCheckout = async () => {
    setCheckoutError('');
    const paymentMethodId = paymentData?.paymentMethods?.[0]?.id;
    
    if (!paymentMethodId) {
      setCheckoutError('No payment method available. Admin must add one.');
      return;
    }

    try {
      if (!cart) return;
      await checkout({
        variables: { input: { orderId: cart.id, paymentMethodId } },
      });
      router.push('/orders');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
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
                      <p className="card-text">${(item.price * item.quantity).toFixed(2)}</p>
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
                  <span className="price">${(cart?.totalPrice ?? 0).toFixed(2)}</span>
                </div>

                {checkoutError && <div className="error-message">{checkoutError}</div>}

                {canCheckout ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleCheckout}
                    disabled={checkoutLoading || items.length === 0}
                  >
                    {checkoutLoading ? 'Processing...' : 'Checkout & Pay'}
                  </button>
                ) : (
                  <div className="error-message" style={{ textAlign: 'center' }}>
                    Only Managers and Admins can checkout orders.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
