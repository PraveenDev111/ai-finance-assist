import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, RefreshControl, TextInput, Platform, Alert } from 'react-native';
import { API_BASE } from '../utils/config';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation, userId, setUserId }) {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({ breakdown: [], recommendations: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');

  const width = Dimensions.get('window').width - 24;

  const fetchData = async () => {
    const [sRes, tRes, bRes] = await Promise.all([
      fetch(`${API_BASE}/summary?user_id=${userId}`),
      fetch(`${API_BASE}/transactions?user_id=${userId}&limit=10`),
      fetch(`${API_BASE}/budget/generate?user_id=${userId}`),
    ]);
    const s = await sRes.json();
    const t = await tRes.json();
    const b = await bRes.json();
    setSummary(s);
    setTransactions(Array.isArray(t) ? t : []);
    setBudget(b);
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh when screen gains focus (after adding a transaction)
  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const pieData = budget.breakdown.map((b, idx) => ({
    name: b.category,
    population: b.percent,
    color: COLORS[idx % COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const saveMonthlyIncome = async () => {
    const amt = parseFloat(incomeAmount || '0');
    if (!amt || isNaN(amt)) {
      Alert.alert('Enter a valid income amount');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          description: 'Monthly Income',
          date: new Date().toISOString().slice(0,10),
          amount: amt,
          type: 'income',
          category: 'Income',
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setIncomeAmount('');
      await fetchData();
      Alert.alert('Saved', 'Monthly income recorded');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.header}>Overview</Text>

        <View style={styles.gridRow}>
          <View style={styles.card}><Text>Total Income{"\n"}<Text style={styles.bold}>₹ {summary.total_income?.toFixed?.(2) || 0}</Text></Text></View>
          <View style={styles.card}><Text>Total Expense{"\n"}<Text style={styles.bold}>₹ {summary.total_expense?.toFixed?.(2) || 0}</Text></Text></View>
        </View>

        <View style={styles.incomeBar}>
          <Text style={styles.subheader}>Record Monthly Income</Text>
          <View style={styles.incomeRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50000"
              keyboardType="decimal-pad"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
            />
            <Button title="Save" onPress={saveMonthlyIncome} />
          </View>
        </View>

        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.subheader}>Budget Breakdown</Text>
          {pieData.length > 0 && (
            <PieChart
              data={pieData}
              width={Math.min(width, 580)}
              height={200}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={'8'}
              chartConfig={chartConfig}
              absolute
            />
          )}
          <View style={{ marginTop: 8 }}>
            <Button title="Generate Budget" onPress={async () => {
              const res = await fetch(`${API_BASE}/budget/generate?user_id=${userId}`);
              const b = await res.json();
              setBudget(b);
              navigation.navigate('Budget', { budget: b });
            }} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.subheader}>Latest Transactions</Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View style={styles.txRow}>
                <Text style={{ flex: 1 }}>{item.description} ({item.category})</Text>
                <Text style={{ color: item.type === 'income' ? 'green' : 'red' }}>₹ {item.amount.toFixed(2)}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No transactions yet.</Text>}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><Button title="Add Transaction" onPress={() => navigation.navigate('AddExpense')} /></View>
          <View style={{ flex: 1 }}><Button color={'#777'} title="Logout" onPress={() => setUserId(null)} /></View>
        </View>
      </View>
    </View>
  );
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#009688'];

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, alignItems: 'center' },
  container: { width: '100%', maxWidth: 960, padding: 12, gap: 12 },
  header: { fontSize: 22, fontWeight: 'bold' },
  subheader: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  gridRow: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  bold: { fontWeight: 'bold' },
  incomeBar: { backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  incomeRow: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minWidth: 140 },
});
