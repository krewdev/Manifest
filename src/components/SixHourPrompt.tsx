import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const STORAGE_KEY_NEXT = 'manifest.nextAtMs';
const STORAGE_KEY_INDEX = 'manifest.exerciseIndex';

const EXERCISES = [
  { key: 'visualize', label: 'Visualization', prompt: 'See it as already real.' },
  { key: 'speak', label: 'Spoken affirmation ×3', prompt: 'Say your intention out loud three times.' },
  { key: 'write', label: 'Written reinforcement', prompt: 'Write a single sentence reinforcing it.' },
];

function getNow() { return Date.now(); }

export const SixHourPrompt: React.FC = () => {
  const [due, setDue] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState<number>(() => {
    const saved = Number(globalThis.localStorage?.getItem(STORAGE_KEY_INDEX) ?? '0');
    return Number.isFinite(saved) ? saved % EXERCISES.length : 0;
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const ls = globalThis.localStorage;
    const now = getNow();
    const raw = ls?.getItem(STORAGE_KEY_NEXT);
    let next = raw ? Number(raw) : NaN;
    if (!Number.isFinite(next) || next < now) {
      // Align next to the next 6-hour boundary
      next = now + SIX_HOURS_MS - (now % SIX_HOURS_MS);
      ls?.setItem(STORAGE_KEY_NEXT, String(next));
    }
    const check = () => {
      const n = getNow();
      const nxt = Number(ls?.getItem(STORAGE_KEY_NEXT) ?? String(next));
      setDue(n >= nxt);
    };
    check();
    timerRef.current = setInterval(check, 30_000) as unknown as number;
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    // Web notification
    if (due && Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Manifest reminder', { body: `${EXERCISES[exerciseIndex].label}: ${EXERCISES[exerciseIndex].prompt}` });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [due, exerciseIndex]);

  const complete = () => {
    const ls = globalThis.localStorage;
    const now = getNow();
    const next = now + SIX_HOURS_MS;
    ls?.setItem(STORAGE_KEY_NEXT, String(next));
    const idx = (exerciseIndex + 1) % EXERCISES.length;
    setExerciseIndex(idx);
    ls?.setItem(STORAGE_KEY_INDEX, String(idx));
    setDue(false);
  };

  if (!due) return null;

  const ex = EXERCISES[exerciseIndex];
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.title}>{ex.label}</Text>
        <Text style={styles.text}>{ex.prompt}</Text>
        <TouchableOpacity style={styles.button} onPress={complete}>
          <Text style={styles.btnText}>OK, done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
    width: '92%',
  },
  title: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  text: { color: 'rgba(255,255,255,0.9)' },
  button: { marginTop: 12, backgroundColor: '#7b61ff', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default SixHourPrompt;

