import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      router.replace('/(main)');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-slate-900">
      <Text className="text-3xl font-bold text-white mb-8">Create Account</Text>
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
      <TouchableOpacity onPress={handleSignup} className="w-full bg-indigo-500 py-4 rounded-xl items-center">
        <Text className="text-white font-bold text-lg">Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} className="mt-4">
        <Text className="text-indigo-400 text-center">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
