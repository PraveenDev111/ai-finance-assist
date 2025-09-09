import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import BudgetScreen from './screens/BudgetScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userId, setUserId] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userId ? (
          <>
            <Stack.Screen name="Dashboard" options={{ title: 'Dashboard' }}>
              {(props) => (<DashboardScreen {...props} userId={userId} setUserId={setUserId} />)}
            </Stack.Screen>
            <Stack.Screen name="AddExpense" options={{ title: 'Add Transaction' }}>
              {(props) => (<AddExpenseScreen {...props} userId={userId} />)}
            </Stack.Screen>
            <Stack.Screen name="Budget" options={{ title: 'Budget' }}>
              {(props) => (<BudgetScreen {...props} userId={userId} />)}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ title: 'Login' }}>
              {(props) => (<LoginScreen {...props} onLogin={setUserId} />)}
            </Stack.Screen>
            <Stack.Screen name="Signup" options={{ title: 'Create Account' }}>
              {(props) => (<SignupScreen {...props} onSignup={setUserId} />)}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
