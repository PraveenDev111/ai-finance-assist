import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { API_BASE } from '../utils/config';
import { Picker } from '@react-native-picker/picker';

export default function AddExpenseScreen({ navigation, userId }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Other');

  const expenseCategories = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Other'];

  const submit = async () => {
    if (!amount) return Alert.alert('Enter amount');
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          description,
          date,
          amount: parseFloat(amount),
          type,
          category: type === 'income' ? 'Income' : category,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      Alert.alert('Success', 'Transaction added');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Transaction</Text>

        <View style={styles.pickerRow}>
          <View style={styles.pickerCol}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={type} onValueChange={(v) => setType(v)}>
                <Picker.Item label="Expense" value="expense" />
                <Picker.Item label="Income" value="income" />
              </Picker>
            </View>
          </View>

          {type === 'expense' && (
            <View style={styles.pickerCol}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={category} onValueChange={(v) => setCategory(v)}>
                  {expenseCategories.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput placeholder="e.g., Uber ride, Restaurant dinner" style={styles.input} value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Amount</Text>
        <TextInput placeholder="Amount" keyboardType='decimal-pad' style={styles.input} value={amount} onChangeText={setAmount} />

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput placeholder="YYYY-MM-DD" style={styles.input} value={date} onChangeText={setDate} />

        <View style={{ marginTop: 8 }}>
          <Button title="Save" onPress={submit} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, alignItems: 'center' },
  container: { width: '100%', maxWidth: 720, backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12, elevation: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  pickerRow: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 12 },
  pickerCol: { flex: 1 },
});
