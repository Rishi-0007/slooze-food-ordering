'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/lib/auth-context';
import { PAYMENT_METHODS_QUERY, CREATE_PAYMENT_METHOD_MUTATION, DELETE_PAYMENT_METHOD_MUTATION } from '@/lib/graphql';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PaymentMethod {
  id: string;
  type: string;
  details: string;
  isDefault: boolean;
}

interface PaymentMethodsData {
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [newType, setNewType] = useState('CREDIT_CARD');
  const [newDetails, setNewDetails] = useState('');

  const { data, loading, error } = useQuery<PaymentMethodsData>(PAYMENT_METHODS_QUERY, { skip: !user });
  const [createPaymentMethod] = useMutation(CREATE_PAYMENT_METHOD_MUTATION, {
    refetchQueries: [{ query: PAYMENT_METHODS_QUERY }],
  });
  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD_MUTATION, {
    refetchQueries: [{ query: PAYMENT_METHODS_QUERY }],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.push('/restaurants');
    }
  }, [user, authLoading, router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetails) return;
    await createPaymentMethod({
      variables: { input: { type: newType, details: newDetails, isDefault: true } },
    });
    setNewDetails('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this payment method?')) {
      await deletePaymentMethod({ variables: { id } });
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return <div className="loading">Loading...</div>;
  }

  const methods: PaymentMethod[] = data?.paymentMethods || [];

  return (
    <>
      <Header />
      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Payment Methods</h1>
          <p className="page-subtitle">Admin only - Manage organization payment methods</p>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error-message">{error.message}</div>}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem' }}>Add New Payment Method</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                style={{ width: 'auto' }}
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="UPI">UPI</option>
              </select>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: '200px' }}
                placeholder="**** **** **** 4242 or UPI handle"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {methods.length === 0 ? (
              <div className="empty-state">No payment methods added</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Default</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((method) => (
                    <tr key={method.id}>
                      <td>{method.type}</td>
                      <td>{method.details}</td>
                      <td>{method.isDefault ? '✓' : ''}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(method.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
