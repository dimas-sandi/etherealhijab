'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [customerToken, setCustomerToken] = useState(null);
  const [customerUser, setCustomerUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load customer session on mount
  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const profile = localStorage.getItem('customer_user');
    if (token && profile) {
      try {
        setCustomerToken(token);
        setCustomerUser(JSON.parse(profile));
      } catch (err) {
        console.error('Failed to parse customer session from local storage', err);
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
      }
    }
    setLoading(false);
  }, []);

  const loginCustomer = async (email, password) => {
    const result = await api.customerLogin(email, password);
    setCustomerToken(result.token);
    setCustomerUser(result.customer);
    localStorage.setItem('customer_token', result.token);
    localStorage.setItem('customer_user', JSON.stringify(result.customer));
    return result;
  };

  const registerCustomer = async (name, email, password) => {
    const result = await api.customerRegister(name, email, password);
    setCustomerToken(result.token);
    setCustomerUser(result.customer);
    localStorage.setItem('customer_token', result.token);
    localStorage.setItem('customer_user', JSON.stringify(result.customer));
    return result;
  };

  const loginCustomerGoogle = async (name, email) => {
    const result = await api.customerGoogleLogin(name, email);
    setCustomerToken(result.token);
    setCustomerUser(result.customer);
    localStorage.setItem('customer_token', result.token);
    localStorage.setItem('customer_user', JSON.stringify(result.customer));
    return result;
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
  };

  const isLoggedIn = !!customerToken;

  return (
    <CustomerContext.Provider
      value={{
        customerToken,
        customerUser,
        isLoggedIn,
        loading,
        loginCustomer,
        registerCustomer,
        loginCustomerGoogle,
        logoutCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);
