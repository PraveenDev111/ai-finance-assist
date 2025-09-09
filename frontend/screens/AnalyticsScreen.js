import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { API_BASE } from '../utils/config';
import { PieChart } from 'react-native-chart-kit';

export default function AnalyticsScreen({ userId }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/transactions?user_id=${userId}&limit=200`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    };
    load();
  }, [userId]);

  const { byCategory, totals } = useMemo(() => {
    const catMap = {};
    let income = 0, expense = 0;
    for (const t of transactions) {
      if (t.type === 'income') income += t.amount; else expense += t.amount;
      if (t.type === 'expense') {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    }
    return { byCategory: catMap, totals: { income, expense, savings: Math.max(income - expense, 0) } };
  }, [transactions]);

  const width = Dimensions.get('window').width - 24;
  const pieData = Object.entries(byCategory).map(([cat, amt], idx) => ({
    name: cat,
    population: Math.round(amt),
    color: COLORS[idx % COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const topSpends = Object.entries(byCategory)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5);

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.header}>Spending Analytics</Text>

        <View style={styles.row}> 
          <View style={styles.card}><Text>Total Income{"\n"}<Text style={styles.bold}>₹ {totals.income.toFixed(2)}</Text></Text></View>
          <View style={styles.card}><Text>Total Expense{ "\n" }<Text style={styles.bold}>₹ {totals.expense.toFixed(2)}</Text></Text></View>
          <View style={styles.card}><Text>Savings{ "\n" }<Text style={styles.bold}>₹ {totals.savings.toFixed(2)}</Text></Text></View>
        </View>

        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.subheader}>Expenses by Category</Text>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={Math.min(width, 720)}
              height={220}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={'8'}
              chartConfig={chartConfig}
              absolute
            />
          ) : (
            <Text>No expense data yet.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.subheader}>Top Categories</Text>
          <FlatList
            data={topSpends}
            keyExtractor={([cat], idx) => cat + idx}
            renderItem={({ item: [cat, amt] }) => (
              <View style={styles.rowItem}>
                <Text style={{ flex: 1 }}>{cat}</Text>
                <Text>₹ {amt.toFixed(2)}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No data</Text>}
          />
        </View>

      </View>
    </View>
  );
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#009688', '#3F51B5'];
const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  page: { flex: 1, padding: 12, alignItems: 'center' },
  container: { width: '100%', maxWidth: 960, gap: 12 },
  header: { fontSize: 22, fontWeight: 'bold' },
  subheader: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, minWidth: 200 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  bold: { fontWeight: 'bold' },
});
