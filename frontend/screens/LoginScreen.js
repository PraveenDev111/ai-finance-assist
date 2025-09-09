import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform, Image } from 'react-native';
import { API_BASE } from '../utils/config';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Please enter email and password');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.user_id);
    } catch (e) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Image source={require('../ai-fin-ass-logo.png')} style={{ width: 180, height: 48, resizeMode: 'contain' }} />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize='none' />
        <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 16, alignSelf: 'center' }}>
          <Text>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 }
});
