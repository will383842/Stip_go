import { Audio } from 'expo-av';
import { useSettingsStore } from '../stores/useSettingsStore';

type SoundName = 'thud_spot' | 'thud_city' | 'thud_region' | 'thud_country' | 'opening' | 'connection' | 'media_posted';

// Sound files — placeholders until Sprint 5-6
// These require actual .aac files in src/assets/sounds/
const soundFiles: Partial<Record<SoundName, number>> = {
  // Uncomment when actual sound files are added:
  // opening: require('../assets/sounds/opening.aac'),
  // thud_spot: require('../assets/sounds/thud_spot.aac'),
  // thud_city: require('../assets/sounds/thud_city.aac'),
  // thud_region: require('../assets/sounds/thud_region.aac'),
  // thud_country: require('../assets/sounds/thud_country.aac'),
  // connection: require('../assets/sounds/connection.aac'),
  // media_posted: require('../assets/sounds/media_posted.aac'),
};

const loadedSounds: Partial<Record<SoundName, Audio.Sound>> = {};

export async function preloadSounds(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: false,
    staysActiveInBackground: false,
  });

  for (const [name, file] of Object.entries(soundFiles)) {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      loadedSounds[name as SoundName] = sound;
    } catch {
      // Sound file not found — skip
    }
  }
}

export async function playSound(name: SoundName): Promise<void> {
  if (!useSettingsStore.getState().soundsEnabled) return;

  const sound = loadedSounds[name];
  if (!sound) return;

  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Playback error — silent fail
  }
}

export async function unloadSounds(): Promise<void> {
  for (const sound of Object.values(loadedSounds)) {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch {
        // Already unloaded
      }
    }
  }
}
