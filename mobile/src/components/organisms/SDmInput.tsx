import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';

interface SDmInputProps {
  onSend: (content: string) => void;
  onPhoto?: () => void;
  onAudio?: () => void;
  placeholder?: string;
}

export default function SDmInput({ onSend, onPhoto, onAudio, placeholder = 'Message...' }: SDmInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    haptic.light();
    playSound('media_posted');
    onSend(text.trim());
    setText('');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#0D0D1A',
        borderTopWidth: 1,
        borderTopColor: '#1A1A2E',
        gap: 8,
      }}
    >
      {/* Photo button */}
      {onPhoto && (
        <Pressable
          onPress={() => { haptic.light(); onPhoto(); }}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="camera-outline" size={24} color="#737373" />
        </Pressable>
      )}

      {/* Audio button */}
      {onAudio && (
        <Pressable
          onPress={() => { haptic.light(); onAudio(); }}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="mic-outline" size={24} color="#737373" />
        </Pressable>
      )}

      {/* Text input */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#1A1A2E',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          maxHeight: 100,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          multiline
          style={{
            color: '#FFFEF5',
            fontFamily: 'PlusJakartaSans-Regular',
            fontSize: 16,
            maxHeight: 80,
          }}
        />
      </View>

      {/* Send button */}
      <Pressable
        onPress={handleSend}
        disabled={!text.trim()}
        style={{
          width: 40,
          height: 40,
          borderRadius: 9999,
          backgroundColor: text.trim() ? '#F5C518' : '#404040',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="send" size={18} color={text.trim() ? '#1A1A2E' : '#737373'} />
      </Pressable>
    </View>
  );
}
