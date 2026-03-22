import React from 'react';
import { Text } from 'react-native';
import { countryFlag } from '../../utils/helpers';

interface SCountryFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
}

const fontSizes = { sm: 16, md: 24, lg: 36 };

export default function SCountryFlag({ countryCode, size = 'md' }: SCountryFlagProps) {
  return <Text style={{ fontSize: fontSizes[size] }}>{countryFlag(countryCode)}</Text>;
}
