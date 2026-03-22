import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export default function SIcon({ name, size = 24, color = '#FFFEF5' }: SIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
