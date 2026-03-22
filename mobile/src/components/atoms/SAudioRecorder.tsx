import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { haptic } from '../../utils/haptics';

interface SAudioRecorderProps {
  maxDurationSec?: number;
  onRecordingComplete: (uri: string, durationSec: number) => void;
  onCancel?: () => void;
}

export default function SAudioRecorder({
  maxDurationSec = 60,
  onRecordingComplete,
  onCancel,
}: SAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseScale = useSharedValue(1);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        true,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= maxDurationSec - 1) {
            stopRecording();
            return maxDurationSec;
          }
          return d + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    haptic.medium();
    setIsRecording(true);
    setDuration(0);
    // Audio recording would use expo-av or expo-audio here
    // For MVP, we record and return the URI on stop
  };

  const stopRecording = async () => {
    haptic.light();
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // In production: stop expo-av recording and get URI
    // For now, simulate completion
    onRecordingComplete('recording_placeholder.m4a', duration);
  };

  const cancelRecording = () => {
    haptic.light();
    setIsRecording(false);
    setDuration(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onCancel?.();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <Pressable
        onPress={startRecording}
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="mic-outline" size={24} color="#737373" />
      </Pressable>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 10,
      }}
    >
      {/* Cancel */}
      <Pressable onPress={cancelRecording} hitSlop={8}>
        <Ionicons name="close" size={20} color="#FF5745" />
      </Pressable>

      {/* Waveform placeholder */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 3,
              height: 4 + Math.random() * 16,
              backgroundColor: '#F5C518',
              borderRadius: 2,
            }}
          />
        ))}
      </View>

      {/* Timer */}
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: 14,
          color: duration > maxDurationSec - 10 ? '#FF5745' : '#FFFEF5',
        }}
      >
        {formatTime(duration)}
      </Text>

      {/* Record indicator + stop */}
      <Animated.View style={pulseStyle}>
        <Pressable
          onPress={stopRecording}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#FF5745',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="stop" size={18} color="#FFFEF5" />
        </Pressable>
      </Animated.View>
    </View>
  );
}
