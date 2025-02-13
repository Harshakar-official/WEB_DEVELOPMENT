import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const ProductListingApp = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [image, setImage] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      setToken(response.data.token);
      setAuthenticated(true);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const addOrUpdateProduct = async () => {
    try {
      const productData = { name, price, size, image };
      const config = { headers: { Authorization: token } };
      if (editingProduct) {
        await axios.put(`http://localhost:5000/products/${editingProduct._id}`, productData, config);
        setEditingProduct(null);
      } else {
        await axios.post('http://localhost:5000/products', productData, config);
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`, { headers: { Authorization: token } });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setSize('');
    setImage('');
  };

  if (!authenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Login</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Management</Text>
      <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Size" value={size} onChangeText={setSize} />
      <TextInput style={styles.input} placeholder="Image URL" value={image} onChangeText={setImage} />
      <Button title={editingProduct ? 'Update Product' : 'Add Product'} onPress={addOrUpdateProduct} />
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text>{item.name} - ${item.price}</Text>
              <Text>Size: {item.size}</Text>
              <TouchableOpacity onPress={() => { setEditingProduct(item); setName(item.name); setPrice(String(item.price)); setSize(item.size); setImage(item.image); }}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProduct(item._id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5, backgroundColor: '#fff' },
  productItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1 },
  productImage: { width: 50, height: 50, marginRight: 10 },
  productDetails: { flex: 1 },
  editButton: { color: 'blue', marginTop: 5 },
  deleteButton: { color: 'red', marginTop: 5 },
});

export default ProductListingApp;
