import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function BudgetScreen({ route }) {
  const { budget } = route.params || { budget: { breakdown: [], recommendations: [] } };
  const width = Dimensions.get('window').width - 24;

  // Mock recommendations if none provided
  const mockRecommendations = [
    "Aim to save at least 20% of your income each month",
    "Consider reducing dining out expenses which are currently high",
    "Your transportation costs could be optimized - consider carpooling or public transport",
    "Set aside 5-10% of your income for emergency savings",
    "Review your subscription services and cancel any unused memberships"
  ];
  
  const displayRecommendations = budget.recommendations?.length > 0 
    ? budget.recommendations 
    : mockRecommendations;

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
          data={displayRecommendations}
          keyExtractor={(item, idx) => String(idx)}
          renderItem={({ item }) => (
            <View style={styles.recommendationItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.recommendationText}>{item}</Text>
            </View>
          )}
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
  subheader: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 12,
    color: '#2c3e50'
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 8, 
    padding: 16, 
    elevation: 2 
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start'
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
    color: '#3498db',
    lineHeight: 22
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e'
  },
});
