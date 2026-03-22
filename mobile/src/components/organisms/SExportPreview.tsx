import React, { useRef } from 'react';
import { View, Text, Dimensions, ScrollView, Pressable } from 'react-native';
import { haptic } from '../../utils/haptics';
import { stampIcon, countryFlag } from '../../utils/helpers';
import type { Stamp, StampTemplate } from '../../types';

interface SExportPreviewProps {
  template: StampTemplate;
  stamp: Stamp;
  userName: string;
  totalStamps: number;
  onSelectTemplate: (template: StampTemplate) => void;
}

const TEMPLATES: StampTemplate[] = ['minimal', 'carte', 'passport', 'photo', 'gradient'];
const PREVIEW_WIDTH = Dimensions.get('window').width - 48;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH / 1080) * 1920;

function stampDisplayName(stamp: Stamp): string {
  switch (stamp.stamp_type) {
    case 'spot': return stamp.spot_name || 'Spot';
    case 'city': return stamp.city_name || 'City';
    case 'region': return stamp.region_name || 'Region';
    case 'country': return countryFlag(stamp.country_code) + ' ' + stamp.country_code.toUpperCase();
    default: return 'Stamp';
  }
}

// Template renderers
function MinimalTemplate({ stamp, userName, totalStamps }: { stamp: Stamp; userName: string; totalStamps: number }) {
  const isDeclared = stamp.source === 'declared';
  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, opacity: isDeclared ? 0.4 : 1 }}>{stampIcon(stamp.stamp_type)}</Text>
      <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, color: isDeclared ? '#A0A0A0' : '#FFFEF5', marginTop: 16, textAlign: 'center' }}>
        {stampDisplayName(stamp)}
      </Text>
      {isDeclared && (
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: '#737373', marginTop: 4 }}>
          {'\u2708\uFE0F'} Non vérifié
        </Text>
      )}
      <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 8 }}>
        {totalStamps} stamps · {userName}
      </Text>
    </View>
  );
}

function GradientTemplate({ stamp, userName, totalStamps }: { stamp: Stamp; userName: string; totalStamps: number }) {
  const isDeclared = stamp.source === 'declared';
  return (
    <View style={{ flex: 1, backgroundColor: '#F5C518', alignItems: 'center', justifyContent: 'center', padding: 24, opacity: isDeclared ? 0.6 : 1 }}>
      <Text style={{ fontSize: 48 }}>{stampIcon(stamp.stamp_type)}</Text>
      <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 22, color: '#1A1A2E', marginTop: 16, textAlign: 'center' }}>
        {stampDisplayName(stamp)}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#1A1A2E', marginTop: 8, opacity: 0.7 }}>
        {totalStamps} stamps · {userName}
      </Text>
    </View>
  );
}

function PassportTemplate({ stamp, userName }: { stamp: Stamp; userName: string }) {
  const isDeclared = stamp.source === 'declared';
  return (
    <View style={{ flex: 1, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={{ borderWidth: 2, borderColor: isDeclared ? 'rgba(245,197,24,0.4)' : '#F5C518', borderRadius: 16, padding: 24, alignItems: 'center', borderStyle: isDeclared ? 'dashed' : 'solid' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#F5C518', letterSpacing: 4 }}>
          WORLD PASSPORT
        </Text>
        <Text style={{ fontSize: 48, marginTop: 12, opacity: isDeclared ? 0.4 : 1 }}>{stampIcon(stamp.stamp_type)}</Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: isDeclared ? '#A0A0A0' : '#FFFEF5', marginTop: 12 }}>
          {stampDisplayName(stamp)}
        </Text>
        {isDeclared && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 10, color: '#737373', marginTop: 2 }}>
            {'\u2708\uFE0F'} Non vérifié
          </Text>
        )}
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 4 }}>
          {userName}
        </Text>
      </View>
    </View>
  );
}

export default function SExportPreview({ template, stamp, userName, totalStamps, onSelectTemplate }: SExportPreviewProps) {
  const renderTemplate = () => {
    switch (template) {
      case 'gradient': return <GradientTemplate stamp={stamp} userName={userName} totalStamps={totalStamps} />;
      case 'passport': return <PassportTemplate stamp={stamp} userName={userName} />;
      default: return <MinimalTemplate stamp={stamp} userName={userName} totalStamps={totalStamps} />;
    }
  };

  return (
    <View>
      {/* Preview */}
      <View
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          borderRadius: 16,
          overflow: 'hidden',
          alignSelf: 'center',
        }}
      >
        {renderTemplate()}
        {/* Stamp number — top right */}
        <Text
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontFamily: 'PlusJakartaSans-Bold',
            fontSize: 16,
            color: '#F5C518',
          }}
        >
          Stamp #{totalStamps}
        </Text>
        {/* Watermark — bottom LEFT, 11px, 50% opacity */}
        <Text
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            fontFamily: 'PlusJakartaSans-Medium',
            fontSize: 12,
            color: '#FFFEF5',
            opacity: 0.5,
          }}
        >
          stamp your world · stip-me.com
        </Text>
      </View>

      {/* Template selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, gap: 8 }}
      >
        {TEMPLATES.map((t) => (
          <Pressable
            key={t}
            onPress={() => { haptic.light(); onSelectTemplate(t); }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              backgroundColor: t === template ? '#F5C518' : '#1A1A2E',
              borderWidth: 1,
              borderColor: t === template ? '#F5C518' : '#404040',
            }}
          >
            <Text
              style={{
                fontFamily: 'PlusJakartaSans-Medium',
                fontSize: 14,
                color: t === template ? '#1A1A2E' : '#FFFEF5',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
