import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface SInputProps extends Omit<TextInputProps, 'style'> {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
}

export default function SInput({
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  label,
  ...rest
}: SInputProps) {
  const [focused, setFocused] = useState(false);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [error, shakeX]);

  return (
    <Animated.View style={[shakeStyle, { width: '100%' }]}>
      {label && (
        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#FFFEF5', marginBottom: 4 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: focused ? '#F5C518' : error ? '#FF5745' : '#404040',
          backgroundColor: 'rgba(26,26,46,0.8)',
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? '#F5C518' : '#737373'}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            color: '#FFFEF5',
            fontFamily: 'PlusJakartaSans-Regular',
            fontSize: 16,
          }}
          {...rest}
        />
      </View>
      {error && (
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#FF5745', marginTop: 4 }}>
          {error}
        </Text>
      )}
    </Animated.View>
  );
}
