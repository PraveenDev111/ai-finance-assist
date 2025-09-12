import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, RefreshControl, TextInput, Platform, Alert, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../utils/config';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function DashboardScreen({ navigation, userId, setUserId }) {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your Finance Assistant. How can I help you today?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const handleLogout = () => {
    setUserId(null);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I'm here to help with your financial questions. What would you like to know?",
        "I can help you track expenses, set budgets, and analyze your spending habits.",
        "Would you like me to show you your spending trends for this month?",
        "I can help you find ways to save money based on your spending patterns."
      ];
      
      const botResponse = {
        id: Date.now() + 1,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        isUser: false
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollViewRef = React.useRef(null);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({ breakdown: [], recommendations: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [qaDesc, setQaDesc] = useState('');
  const [qaAmount, setQaAmount] = useState('');
  const [qaType, setQaType] = useState('expense');
  const [qaCategory, setQaCategory] = useState('Other');

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

  const expenseCategories = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Other'];

  const quickAdd = async () => {
    const amt = parseFloat(qaAmount || '0');
    if (!qaDesc || !amt || isNaN(amt)) {
      Alert.alert('Please enter description and a valid amount');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          description: qaDesc,
          date: new Date().toISOString().slice(0,10),
          amount: amt,
          type: qaType,
          category: qaType === 'income' ? 'Income' : qaCategory,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setQaDesc(''); setQaAmount(''); setQaType('expense'); setQaCategory('Other');
      await fetchData();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
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
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.container}>
        <Text style={styles.header}>Overview</Text>

        {/* Top stats row: Income, Expense, Savings */}
        {(() => {
          const income = Number(summary.total_income || 0);
          const expense = Number(summary.total_expense || 0);
          const savings = Math.max(income - expense, 0);
          return (
            <View style={styles.gridRow}>
              <View style={styles.card}><Text>Total Income{"\n"}<Text style={styles.bold}>Rs. {income.toFixed(2)}</Text></Text></View>
              <View style={styles.card}><Text>Total Expense{"\n"}<Text style={styles.bold}>Rs. {expense.toFixed(2)}</Text></Text></View>
              <View style={styles.card}><Text>Savings{"\n"}<Text style={styles.bold}>Rs. {savings.toFixed(2)}</Text></Text></View>
            </View>
          );
        })()}
        {/* Monthly Income */}
        <View style={styles.card}>
          <Text style={styles.subheader}>Record Monthly Income</Text>
          <View style={[styles.rowWrap, { flexWrap: 'wrap' }]}>
            <TextInput
              style={[styles.input, { flex: Platform.OS === 'web' ? 2 : undefined, width: Platform.OS === 'web' ? undefined : '100%' }]}
              placeholder="e.g., 50000"
              keyboardType="decimal-pad"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
            />
            <View style={{ marginTop: Platform.OS === 'web' ? 0 : 8, alignSelf: 'flex-start' }}>
              <Button title="Save" onPress={saveMonthlyIncome} />
            </View>
          </View>
        </View>

        {/* Quick Add Transaction */}
        <View style={styles.card}>
          <Text style={styles.subheader}>Quick Add Transaction</Text>
          <View style={{ gap: 8 }}>
            <View style={[styles.rowWrap, { flexWrap: 'wrap' }]}>
              <TextInput 
                style={[styles.input, { flex: 2, minWidth: 120 }]} 
                placeholder="Description" 
                value={qaDesc} 
                onChangeText={setQaDesc} 
              />
              <TextInput 
                style={[styles.input, { flex: 1, minWidth: 100 }]} 
                placeholder="Amount" 
                keyboardType='decimal-pad' 
                value={qaAmount} 
                onChangeText={setQaAmount} 
              />
            </View>
            <View style={[styles.rowWrap, { flexWrap: 'wrap', gap: 8 }]}>
              <View style={[styles.pickerWrapper, { flex: 1, minWidth: 120 }]}>
                <Picker selectedValue={qaType} onValueChange={setQaType}>
                  <Picker.Item label="Expense" value="expense" />
                  <Picker.Item label="Income" value="income" />
                </Picker>
              </View>
              {qaType === 'expense' && (
                <View style={[styles.pickerWrapper, { flex: 1, minWidth: 140 }]}>
                  <Picker selectedValue={qaCategory} onValueChange={setQaCategory}>
                    {expenseCategories.map((c) => <Picker.Item key={c} label={c} value={c} />)}
                  </Picker>
                </View>
              )}
              <View style={{ alignSelf: 'flex-start' }}>
                <Button title="Add" onPress={quickAdd} />
              </View>
            </View>
          </View>
        </View>

        {/* Latest Transactions */}
        <View style={styles.card}>
          <Text style={styles.subheader}>Latest Transactions</Text>
          <FlatList
            data={transactions}
            scrollEnabled={false}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View style={[styles.txRow, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }]}>
                <Text style={{ flex: 1, fontSize: 15 }}>{item.description} ({item.category})</Text>
                <Text style={{ 
                  color: item.type === 'income' ? '#2ecc71' : '#e74c3c',
                  fontWeight: '500',
                  fontSize: 15
                }}>
                  {item.type === 'income' ? '+' : '-'}Rs. {item.amount.toFixed(2)}
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#7f8c8d' }}>No transactions yet.</Text>}
          />
        </View>

        {/* Budget Breakdown */}
        <View style={styles.card}>
          <Text style={styles.subheader}>Budget Breakdown</Text>
          {pieData.length > 0 && (
            <View style={{ alignItems: 'center', overflow: 'hidden' }}>
              <PieChart
                data={pieData}
                width={Math.min(Dimensions.get('window').width - 56, 400)}
                height={220}
                accessor={'population'}
                backgroundColor={'transparent'}
                paddingLeft={'8'}
                chartConfig={chartConfig}
                absolute
                hasLegend={false}
              />
              {/* Custom Legend */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16, gap: 12 }}>
                {pieData.map((item, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 }}>
                    <View style={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: item.color, 
                      marginRight: 6, 
                      borderRadius: 2 
                    }} />
                    <Text style={{ fontSize: 13 }}>{item.name}: {item.population}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Full width: Savings Insights */}
        <View style={styles.card}>
          <Text style={styles.subheader}>Savings Insights</Text>
          {(() => {
            const income = Number(summary.total_income || 0);
            const expense = Number(summary.total_expense || 0);
            const savings = Math.max(income - expense, 0);
            const rate = income > 0 ? Math.round((savings / income) * 100) : 0;
            const tips = [];
            if (rate < 10) tips.push('Your savings rate is below 10%. Try moving recurring subscriptions to a lower tier.');
            if (expense > income) tips.push('You are spending more than you earn. Consider a short-term spending freeze on non-essentials.');
            if (savings > 0 && rate >= 20) tips.push('Great job! You are meeting a healthy 20%+ savings target. Consider automating investments.');
            if (tips.length === 0) tips.push('Stay consistent. Track categories weekly and set small goals per category.');
            return (
              <View>
                <Text>Estimated Savings: Rs. {savings.toFixed(2)} ({rate}%)</Text>
                {tips.map((t, i) => (<Text key={i}>• {t}</Text>))}
              </View>
            );
          })()}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><Button title="Add Transaction" onPress={() => navigation.navigate('AddExpense')} /></View>
          <View style={{ flex: 1 }}><Button color={'#777'} title="Logout" onPress={handleLogout} /></View>
          <View style={{ flex: 1 }}><Button color={'#2196F3'} title="Analytics" onPress={() => navigation.navigate('Analytics')} /></View>
        </View>
        </View>
      </ScrollView>
      
      {/* Floating Chat Button */}
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => setIsChatVisible(true)}
      >
        <Ionicons name="chatbubbles" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Popup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isChatVisible}
        onRequestClose={() => setIsChatVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Finance Assistant</Text>
              <TouchableOpacity onPress={() => setIsChatVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.chatContainer}>
              <ScrollView 
                style={styles.chatMessages}
                ref={scrollViewRef}
                onContentSizeChange={() => {
                  if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                  }
                }}
              >
                {messages.map((message) => (
                  <View 
                    key={message.id}
                    style={[
                      styles.messageBubble, 
                      message.isUser ? styles.userBubble : styles.botBubble
                    ]}
                  >
                    <Text style={message.isUser ? styles.userText : styles.botText}>
                      {message.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type your message..."
                  placeholderTextColor="#999"
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  onSubmitEditing={handleSendMessage}
                  onKeyPress={handleKeyPress}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!inputMessage.trim()}
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  page: { flex: 1, padding: 12, backgroundColor: '#f5f5f5' },
  container: { 
    flex: 1, 
    maxWidth: 1200, 
    width: '100%', 
    marginHorizontal: 'auto', 
    position: 'relative',
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  subheader: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 12,
    color: '#2c3e50',
  },
  gridRow: { 
    flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
    gap: 12, 
    marginBottom: 12,
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: Platform.OS === 'web' ? 0 : 12,
    width: '100%',
  },
  txRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  bold: {
    fontWeight: 'bold',
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: Platform.OS === 'web' ? 'flex-end' : 'stretch',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    width: Platform.OS === 'web' ? '30%' : '100%',
    maxWidth: 500,
    alignSelf: Platform.OS === 'web' ? 'flex-end' : 'center',
    marginHorizontal: Platform.OS === 'web' ? 20 : 0,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  botBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  botText: {
    color: '#212121',
    fontSize: 16,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  incomeBar: { backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, margin: 8 },
  incomeRow: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 8, alignItems: 'center' },
  rowWrap: { 
    flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
    gap: 8, 
    alignItems: 'center',
    width: '100%',
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    minWidth: 120,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
});
