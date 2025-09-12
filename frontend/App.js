import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import BudgetScreen from './screens/BudgetScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ChatBotScreen from './screens/ChatBotScreen';
import LogoutScreen from './screens/LogoutScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      } catch (error) {
        console.error('Failed to load user session', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Handle user login/logout
  const handleLogin = async (id) => {
    try {
      await AsyncStorage.setItem('userId', id.toString());
      setUserId(parseInt(id, 10));
    } catch (error) {
      console.error('Failed to save user session', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setUserId(null);
    } catch (error) {
      console.error('Failed to remove user session', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const headerLogo = () => (
    <View style={{ alignItems: 'center' }}>
      <Image
        source={require('./ai-fin-ass-logo.png')}
        style={{ width: 140, height: 36, resizeMode: 'contain' }}
      />
    </View>
  );

  const AppDrawer = () => (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerTitle: headerLogo,
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="Dashboard">
        {(props) => (<DashboardScreen {...props} userId={userId} setUserId={handleLogout} />)}
      </Drawer.Screen>
      <Drawer.Screen name="Add Transaction" options={{ title: 'Add Transaction' }}>
        {(props) => (<AddExpenseScreen {...props} userId={userId} />)}
      </Drawer.Screen>
      <Drawer.Screen name="Budget" options={{ title: 'Budget' }}>
        {(props) => (<BudgetScreen {...props} userId={userId} />)}
      </Drawer.Screen>
      <Drawer.Screen name="Analytics" options={{ title: 'Analytics' }}>
        {(props) => (<AnalyticsScreen {...props} userId={userId} />)}
      </Drawer.Screen>
      <Drawer.Screen name="Chat with AI" options={{ title: 'AI Assistant' }}>
        {(props) => (<ChatBotScreen {...props} />)}
      </Drawer.Screen>
      <Drawer.Screen name="Logout" options={{ title: 'Logout' }}>
        {(props) => (<LogoutScreen {...props} onLogout={() => setUserId(null)} />)}
      </Drawer.Screen>
    </Drawer.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userId ? (
          <>
            <Stack.Screen name="Login">
              {() => <LoginScreen onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" options={{ title: 'Create Account' }}>
              {(props) => (<SignupScreen {...props} onSignup={handleLogin} />)}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Dashboard" component={AppDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
