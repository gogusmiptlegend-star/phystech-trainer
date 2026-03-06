import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Study tree storage ──────────────────────────────
export async function getStudyState() {
  try {
    const raw = await AsyncStorage.getItem('mfti_tree');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function setStudyState(s) {
  try { await AsyncStorage.setItem('mfti_tree', JSON.stringify(s)); } catch {}
}

export function nodeKey(subjectId, laneId, ni) {
  return `${subjectId}__${laneId}__${ni}`;
}

// ── Gym storage ─────────────────────────────────────
export async function getGymSessions() {
  try {
    const raw = await AsyncStorage.getItem('gym_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveGymSessions(arr) {
  try { await AsyncStorage.setItem('gym_sessions', JSON.stringify(arr)); } catch {}
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function fmtDate(key) {
  const parts = key.split('-');
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  return `${parseInt(parts[2])} ${months[parseInt(parts[1])-1]} ${parts[0]}`;
}
