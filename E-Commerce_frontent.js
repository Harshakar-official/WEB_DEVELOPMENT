import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [registerMode, setRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [adminView, setAdminView] = useState(false);
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (token) {
      setUser({ token, role: userRole });
      fetchCart();
      if (userRole === 'admin') {
        setAdminView(true);
        fetchOrders();
      }
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/cart', {
        headers: { Authorization: token },
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/admin/orders', {
        headers: { Authorization: token },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setUser(response.data);
      fetchCart();
      if (response.data.role === 'admin') {
        setAdminView(true);
        fetchOrders();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: token } }
      );
      fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Failed to update cart item');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/products/${productId}`, {
        headers: { Authorization: token },
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/orders',
        { products: cart.map(item => ({ productId: item.productId._id, quantity: item.quantity })),
          total: cart.reduce((sum, item) => sum + item.productId.price * item.quantity, 0) },
        { headers: { Authorization: token } }
      );
      alert('Checkout successful!');
      setCart([]);
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Failed to complete checkout');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center">E-Commerce Dashboard</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {user ? (
        <div className="text-center mb-4">
          <h3 className="text-lg">Welcome, {user.role === 'admin' ? 'Admin' : 'User'}</h3>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => { localStorage.clear(); setUser(null); setAdminView(false); }}>Logout</button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <input className="w-full p-2 border rounded" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-2 border rounded mt-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default App;
