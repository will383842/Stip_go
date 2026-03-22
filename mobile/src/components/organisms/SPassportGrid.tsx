import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { countryFlag } from '../../utils/helpers';
import { haptic } from '../../utils/haptics';
import type { StampedCountry, StampSource } from '../../types';

// ISO 3166-1 alpha-2 codes for all 193 UN member states
const ALL_COUNTRIES = [
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BT',
  'BO','BA','BW','BR','BN','BG','BF','BI','CV','KH','CM','CA','CF','TD','CL','CN','CO','KM','CG','CD',
  'CR','CI','HR','CU','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI',
  'FR','GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IR','IQ',
  'IE','IL','IT','JM','JP','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI',
  'LT','LU','MG','MW','MY','MV','ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM',
  'NA','NR','NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PA','PG','PY','PE','PH','PL','PT',
  'QA','RO','RU','RW','KN','LC','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO',
  'ZA','SS','ES','LK','SD','SR','SE','CH','SY','TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV',
  'UG','UA','AE','GB','US','UY','UZ','VU','VE','VN','YE','ZM','ZW',
];

interface SPassportGridProps {
  stampedCountries: StampedCountry[];
  onStampPress: (countryCode: string) => void;
}

export default function SPassportGrid({ stampedCountries, onStampPress }: SPassportGridProps) {
  const countrySourceMap = new Map<string, StampSource>();
  stampedCountries.forEach((sc) => countrySourceMap.set(sc.country_code, sc.source));

  const renderCountry = ({ item }: { item: string }) => {
    const source = countrySourceMap.get(item);
    const isStamped = !!source;
    const isDeclared = source === 'declared';
    const isVerified = source === 'gps' || source === 'imported';

    return (
      <Pressable
        onPress={() => {
          haptic.light();
          onStampPress(item);
        }}
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 4,
          borderRadius: 9999,
          backgroundColor: isVerified
            ? 'rgba(245,197,24,0.1)'
            : isDeclared
              ? 'rgba(245,197,24,0.05)'
              : 'rgba(26,26,46,0.4)',
          borderWidth: isStamped ? 1.5 : 0,
          borderColor: isVerified ? '#F5C518' : isDeclared ? 'rgba(245,197,24,0.4)' : 'transparent',
          borderStyle: isDeclared ? 'dashed' : 'solid',
        }}
      >
        {/* Flag — full color if GPS, semi-transparent if declared, greyed if not stamped */}
        <Text style={{
          fontSize: 24,
          opacity: isVerified ? 1 : isDeclared ? 0.4 : 0.25,
        }}>
          {countryFlag(item)}
        </Text>
        {/* Verified checkmark */}
        {isVerified && (
          <Text style={{ fontSize: 10, position: 'absolute', bottom: 1, right: 4, color: '#F5C518' }}>
            {'\u2713'}
          </Text>
        )}
        {/* Declared plane icon */}
        {isDeclared && (
          <Text style={{ fontSize: 9, position: 'absolute', bottom: 1, right: 3, opacity: 0.5 }}>
            {'\u2708\uFE0F'}
          </Text>
        )}
        {/* Lock icon for unstamped */}
        {!isStamped && (
          <Text style={{ fontSize: 12, position: 'absolute', bottom: 2, right: 2, opacity: 0.4 }}>
            {'\u{1F512}'}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={ALL_COUNTRIES}
      renderItem={renderCountry}
      keyExtractor={(item) => item}
      numColumns={5}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
