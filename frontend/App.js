import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import BudgetScreen from './screens/BudgetScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import LogoutScreen from './screens/LogoutScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [userId, setUserId] = useState(null);

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
        {(props) => (<DashboardScreen {...props} userId={userId} setUserId={setUserId} />)}
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
      <Drawer.Screen name="Logout" options={{ title: 'Logout' }}>
        {(props) => (<LogoutScreen {...props} onLogout={() => setUserId(null)} />)}
      </Drawer.Screen>
    </Drawer.Navigator>
  );

  return (
    <NavigationContainer>
      {userId ? (
        <AppDrawer />
      ) : (
        <Stack.Navigator screenOptions={{ headerTitle: headerLogo, headerTitleAlign: 'center' }}>
          <Stack.Screen name="Login" options={{ title: 'Login' }}>
            {(props) => (<LoginScreen {...props} onLogin={setUserId} />)}
          </Stack.Screen>
          <Stack.Screen name="Signup" options={{ title: 'Create Account' }}>
            {(props) => (<SignupScreen {...props} onSignup={setUserId} />)}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
