import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LogoutScreen({ navigation, onLogout }) {
  useEffect(() => {
    // no-op on mount
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign out</Text>
        <Text style={{ marginBottom: 12 }}>Are you sure you want to log out?</Text>
        <Button title="Logout" onPress={() => {
          onLogout?.();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
