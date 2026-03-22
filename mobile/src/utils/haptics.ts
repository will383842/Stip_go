import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/useSettingsStore';

export const haptic = {
  light: () => {
    if (useSettingsStore.getState().hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  medium: () => {
    if (useSettingsStore.getState().hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  heavy: () => {
    if (useSettingsStore.getState().hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },
  selection: () => {
    if (useSettingsStore.getState().hapticEnabled) {
      Haptics.selectionAsync();
    }
  },
  notification: (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (useSettingsStore.getState().hapticEnabled) {
      Haptics.notificationAsync(type);
    }
  },
};
