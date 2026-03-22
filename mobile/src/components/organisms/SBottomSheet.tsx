import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';

interface SBottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
  snapPoint?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SBottomSheet({ children, onClose, snapPoint = 0.5 }: SBottomSheetProps) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.duration(200)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: SCREEN_HEIGHT * snapPoint,
          backgroundColor: 'rgba(13,13,26,0.95)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: '#404040',
          paddingBottom: 34, // safe area
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#737373' }} />
        </View>

        {children}
      </Animated.View>
    </View>
  );
}
