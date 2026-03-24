import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';

export default function MainScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  }, [scale]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <View className="flex-1 bg-slate-900 justify-between items-center py-12">
      <View className="items-center mt-12">
        <Animated.View style={{ transform: [{ scale }] }} className="rounded-full bg-slate-900 shadow-2xl shadow-indigo-500 border-4 border-indigo-500/50 p-1">
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            className="w-40 h-40 rounded-full"
          />
        </Animated.View>
        <Text className="text-white text-2xl font-bold mt-6">AI Companion</Text>
      </View>

      <View className="flex-1 justify-center w-full px-8">
        {isRecording ? (
          <View className="h-24 bg-indigo-500/20 rounded-xl justify-center items-center overflow-hidden">
             <Text className="text-indigo-400 font-bold">Listening...</Text>
             <View className="flex-row items-end mt-4 h-8">
                <View className="w-1 h-4 bg-indigo-500 mx-1 rounded-full" />
                <View className="w-1 h-8 bg-indigo-500 mx-1 rounded-full" />
                <View className="w-1 h-5 bg-indigo-500 mx-1 rounded-full" />
                <View className="w-1 h-7 bg-indigo-500 mx-1 rounded-full" />
                <View className="w-1 h-3 bg-indigo-500 mx-1 rounded-full" />
             </View>
          </View>
        ) : (
          <Text className="text-slate-500 text-center text-lg">Tap the mic to start speaking</Text>
        )}
      </View>

      <TouchableOpacity 
        onPress={toggleRecording}
        className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isRecording ? 'bg-red-500' : 'bg-indigo-500'}`}
      >
        <Text className="text-white text-3xl">🎤</Text>
      </TouchableOpacity>
    </View>
  );
}
