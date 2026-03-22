import React, { useRef, useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';

interface SOtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

export default function SOtpInput({ length = 6, onComplete }: SOtpInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Handle paste of full code
    if (text.length === length) {
      const digits = text.replace(/\D/g, '').slice(0, length).split('');
      setCode(digits);
      if (digits.length === length) {
        onComplete(digits.join(''));
      }
      inputs.current[length - 1]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = text.replace(/\D/g, '').slice(-1);
    setCode(newCode);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const joined = newCode.join('');
    if (joined.length === length && !newCode.includes('')) {
      onComplete(joined);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          value={code[i]}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          keyboardType="number-pad"
          maxLength={i === 0 ? length : 1}
          textContentType="oneTimeCode"
          autoComplete={i === 0 ? 'sms-otp' : 'off'}
          style={{
            width: 48,
            height: 56,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: code[i] ? '#F5C518' : '#404040',
            backgroundColor: '#1A1A2E',
            color: '#FFFEF5',
            fontSize: 24,
            fontFamily: 'PlusJakartaSans-Bold',
            textAlign: 'center',
          }}
        />
      ))}
    </View>
  );
}
