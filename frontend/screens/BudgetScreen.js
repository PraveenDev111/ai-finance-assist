import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function BudgetScreen({ route }) {
  const { budget } = route.params || { budget: { breakdown: [], recommendations: [] } };
  const width = Dimensions.get('window').width - 24;

  const pieData = (budget.breakdown || []).map((b, idx) => ({
    name: b.category,
    population: b.percent,
    color: COLORS[idx % COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Suggested Budget</Text>
      {pieData.length > 0 && (
        <PieChart
          data={pieData}
          width={width}
          height={200}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'8'}
          chartConfig={chartConfig}
          absolute
        />
      )}
      <View style={styles.card}>
        <Text style={styles.subheader}>Recommendations</Text>
        <FlatList
          data={budget.recommendations || []}
          keyExtractor={(item, idx) => String(idx)}
          renderItem={({ item }) => <Text style={{ marginBottom: 8 }}>• {item}</Text>}
          ListEmptyComponent={<Text>No recommendations yet.</Text>}
        />
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
  container: { flex: 1, padding: 12, gap: 12 },
  header: { fontSize: 22, fontWeight: 'bold' },
  subheader: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
});
