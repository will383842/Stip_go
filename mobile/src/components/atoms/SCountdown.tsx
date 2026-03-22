import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

interface SCountdownProps {
  expiresAt: string;
  onExpired?: () => void;
  style?: object;
}

export default function SCountdown({ expiresAt, onExpired, style }: SCountdownProps) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expiré');
        onExpired?.();
        return;
      }
      const minutes = Math.floor(diff / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      setRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const isUrgent = new Date(expiresAt).getTime() - Date.now() < 30_000;

  return (
    <Text
      style={[
        {
          fontFamily: 'PlusJakartaSans-Bold',
          fontSize: 14,
          color: isUrgent ? '#FF5745' : '#F5C518',
        },
        style,
      ]}
    >
      {remaining}
    </Text>
  );
}
