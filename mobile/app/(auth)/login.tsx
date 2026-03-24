import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      
      if (res.data?.token) {
        await SecureStore.setItemAsync('token', res.data.token);
      }
      
      router.replace('/(main)');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-slate-900">
      <Text className="text-3xl font-bold text-white mb-8">Welcome Back</Text>
      <TextInput 
        className="w-full bg-slate-800 text-white p-4 rounded-xl mb-4" 
        placeholder="Email" 
        placeholderTextColor="#9ca3af"
        value={email} onChangeText={setEmail}
      />
      <TextInput 
        className="w-full bg-slate-800 text-white p-4 rounded-xl mb-8" 
        placeholder="Password" 
        secureTextEntry 
        placeholderTextColor="#9ca3af"
        value={password} onChangeText={setPassword}
      />
      <TouchableOpacity onPress={handleLogin} className="w-full bg-indigo-500 py-4 rounded-xl items-center">
        <Text className="text-white font-bold text-lg">Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/signup')} className="mt-4">
        <Text className="text-indigo-400 text-center">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
