import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatBotScreen() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your Finance Assistant. How can I help you with your finances today?", sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Mock bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I can help analyze your spending patterns. Would you like to see a breakdown by category?",
        "Based on your recent transactions, you're spending more on dining out this month.",
        "I can suggest ways to save more based on your spending habits. Would you like some tips?",
        "Your savings rate is currently 15%. Let's work on improving that together!",
        "I notice you haven't set a budget yet. Would you like me to help you create one?"
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage = { id: Date.now() + 1, text: randomResponse, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Finance Assistant</Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble, 
              message.sender === 'user' ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text style={message.sender === 'user' ? styles.userText : styles.botText}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about your finances..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  botBubble: {
    backgroundColor: '#e1f5fe',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botText: {
    color: '#212121',
    fontSize: 16,
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
