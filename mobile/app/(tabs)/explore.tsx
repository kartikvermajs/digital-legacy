import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
  traits: string;
  tone: string;
  gender: string | null;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    category: 'all',
    age: 'all',
  });

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        // Handle no token
        setLoading(false);
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await axios.get(`${apiUrl}/api/personas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPersonas(res.data);
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      const traitsLower = (p.traits || "").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();
      const toneLower = (p.tone || "").toLowerCase();
      const genderLower = (p.gender || "").toLowerCase();
      const searchLower = search.toLowerCase();

      const matchesSearch = search === "" || nameLower.includes(searchLower) || traitsLower.includes(searchLower);
      const matchesGender = filters.gender === "all" || genderLower === filters.gender.toLowerCase() || new RegExp(`\\b${filters.gender.toLowerCase()}\\b`).test(traitsLower);
      const matchesAge = filters.age === "all" || traitsLower.includes(filters.age.replace("-", " "));
      const matchesCategory = filters.category === "all" || toneLower.includes(filters.category) || traitsLower.includes(filters.category);

      return matchesSearch && matchesGender && matchesAge && matchesCategory;
    });
  }, [personas, search, filters]);

  const FilterButton = ({ label, value, current, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`px-4 py-2 rounded-full border border-indigo-500/30 mr-2 ${current === value ? 'bg-indigo-600' : 'bg-slate-800'}`}
    >
      <Text className={`font-semibold ${current === value ? 'text-white' : 'text-indigo-200'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900 border-none">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold text-white mb-4">Explore AI</Text>
        
        <TextInput
          placeholder="Search characters..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          className="w-full bg-slate-800 text-white p-4 rounded-xl mb-6"
        />

        <View className="mb-4">
          <Text className="text-slate-400 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Gender</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <FilterButton label="All" value="all" current={filters.gender} onPress={() => setFilters({...filters, gender: 'all'})} />
            <FilterButton label="Female" value="female" current={filters.gender} onPress={() => setFilters({...filters, gender: 'female'})} />
            <FilterButton label="Male" value="male" current={filters.gender} onPress={() => setFilters({...filters, gender: 'male'})} />
            <FilterButton label="Non-binary" value="non-binary" current={filters.gender} onPress={() => setFilters({...filters, gender: 'non-binary'})} />
          </ScrollView>
        </View>

        <View className="mb-6">
          <Text className="text-slate-400 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <FilterButton label="All" value="all" current={filters.category} onPress={() => setFilters({...filters, category: 'all'})} />
            <FilterButton label="Mentor" value="mentor" current={filters.category} onPress={() => setFilters({...filters, category: 'mentor'})} />
            <FilterButton label="Friend" value="friend" current={filters.category} onPress={() => setFilters({...filters, category: 'friend'})} />
            <FilterButton label="Expert" value="expert" current={filters.category} onPress={() => setFilters({...filters, category: 'expert'})} />
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : filteredPersonas.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-slate-400 text-center text-lg">No characters found matching your criteria.</Text>
        </View>
      ) : (
        <ScrollView className="px-4">
          <View className="flex-row flex-wrap justify-between">
            {filteredPersonas.map((persona) => (
              <TouchableOpacity
                key={persona.id}
                className="w-[48%] bg-slate-800 rounded-2xl overflow-hidden mb-4 border border-slate-700"
              >
                <View className="h-32 bg-slate-900 relative">
                  {persona.avatarUrl ? (
                    <Image source={{ uri: persona.avatarUrl }} className="w-full h-full" />
                  ) : (
                    <View className="flex-1 justify-center items-center">
                      <Text className="text-4xl text-indigo-500 font-bold">{persona.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View className="absolute bottom-2 right-2 bg-indigo-600/90 px-2 py-1 rounded-md">
                    <Text className="text-white text-xs font-bold uppercase">{persona.tone}</Text>
                  </View>
                </View>
                <View className="p-3">
                  <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{persona.name}</Text>
                  <Text className="text-slate-400 text-sm" numberOfLines={2}>{persona.traits || 'No traits described.'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View className="h-24" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
