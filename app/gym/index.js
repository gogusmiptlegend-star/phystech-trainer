import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, Modal, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { colors } from '../../src/theme';
import { EXERCISES } from '../../src/data';
import { getGymSessions, saveGymSessions, todayKey, fmtDate } from '../../src/storage';

export default function GymScreen() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    getGymSessions().then(all => {
      setSessions(all);
      const key = todayKey();
      let today = all.find(s => s.date === key);
      if (!today) {
        today = { date: key, duration: '', km: '', exercises: {} };
        const updated = [today, ...all];
        setSessions(updated);
        saveGymSessions(updated);
      }
      setSession({ ...today });
    });
  }, []);

  async function persist(updated) {
    setSession(updated);
    const all = await getGymSessions();
    const idx = all.findIndex(s => s.date === updated.date);
    if (idx >= 0) all[idx] = updated; else all.unshift(updated);
    setSessions([...all]);
    await saveGymSessions(all);
  }

  function newSession() {
    const key = todayKey() + '-' + Date.now();
    const fresh = { date: key, duration: '', km: '', exercises: {} };
    persist(fresh);
  }

  if (!session) return (
    <SafeAreaView style={styles.safe}>
      <Text style={[styles.dimText, {padding:32, textAlign:'center'}]}>Загрузка...</Text>
    </SafeAreaView>
  );

  const doneCount = EXERCISES.filter(ex => session.exercises[ex.id]?.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSub}>// ФИЗО ТРЕКЕР</Text>
          <Text style={styles.headerName}>ТРЕНИРОВКА</Text>
        </View>
        <Text style={{fontSize:22}}>🔥</Text>
      </View>

      {/* Session bar */}
      <View style={styles.sessBar}>
        <Text style={styles.sessDate}>{fmtDate(session.date.split('-').slice(0,3).join('-'))}</Text>
        <View style={{flexDirection:'row', gap:8}}>
          <TouchableOpacity style={styles.sbtn} onPress={() => setHistoryOpen(true)}>
            <Text style={styles.sbtnText}>📋 История</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sbtn, styles.sbtnNew]} onPress={newSession}>
            <Text style={[styles.sbtnText, {color:'#fca5a5'}]}>+ Новая</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cardio row (run) */}
      <View style={styles.runCard}>
        <Text style={styles.runIcon}>🏃</Text>
        <Text style={styles.runLabel}>Бег</Text>
        <TextInput
          style={styles.runInput}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor={colors.dim}
          value={session.exercises['run']?.minutes || ''}
          onChangeText={v => {
            const ex = { ...session.exercises };
            ex['run'] = { ...ex['run'], minutes: v };
            persist({ ...session, exercises: ex });
          }}
        />
        <Text style={styles.runUnit}>мин</Text>
        <TextInput
          style={styles.runInput}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor={colors.dim}
          value={session.exercises['run']?.km || ''}
          onChangeText={v => {
            const ex = { ...session.exercises };
            ex['run'] = { ...ex['run'], km: v };
            persist({ ...session, exercises: ex });
          }}
        />
        <Text style={styles.runUnit}>км</Text>
        <Text style={styles.doneCount}>{doneCount}/{EXERCISES.length}</Text>
      </View>

      {/* Exercise list */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {EXERCISES.filter(ex => ex.type !== 'cardio').map((ex, idx) => {
          const exData = session.exercises[ex.id] || {};
          const done = !!exData.done;
          return (
            <ExCard
              key={ex.id}
              ex={ex}
              idx={idx + 1}
              exData={exData}
              done={done}
              onToggleDone={() => {
                const exercises = { ...session.exercises };
                exercises[ex.id] = { ...exData, done: !done };
                persist({ ...session, exercises });
              }}
              onNotesChange={v => {
                const exercises = { ...session.exercises };
                exercises[ex.id] = { ...exData, notes: v };
                persist({ ...session, exercises });
              }}
            />
          );
        })}
        <View style={{height:32}} />
      </ScrollView>

      {/* History Modal */}
      <Modal visible={historyOpen} animationType="slide" onRequestClose={() => setHistoryOpen(false)}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.histHeader}>
            <TouchableOpacity style={styles.back} onPress={() => setHistoryOpen(false)}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.histTitle}>История тренировок</Text>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {sessions.length === 0 && (
              <Text style={[styles.dimText, {textAlign:'center', padding:40}]}>Нет записей</Text>
            )}
            {sessions.map((sess, si) => (
              <HistSession key={si} sess={sess} />
            ))}
            <View style={{height:32}} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ExCard({ ex, idx, exData, done, onToggleDone, onNotesChange }) {
  const [open, setOpen] = useState(false);
  const placeholder = ex.type === 'weight'
    ? `напр. 3×10 · ${ex.unit || 'кг'}: 20`
    : 'напр. 3×12, последний подход до отказа';
  const summary = exData.notes ? exData.notes.split('\n')[0].slice(0, 22) : (done ? '✓' : '');

  return (
    <View style={[styles.exCard, done && styles.exCardDone]}>
      <TouchableOpacity style={styles.exHeader} activeOpacity={0.7} onPress={() => setOpen(o => !o)}>
        <View style={[styles.exNum, done && styles.exNumDone]}>
          <Text style={styles.exNumText}>{idx}</Text>
        </View>
        <Text style={[styles.exName, done && styles.exNameDone]}>{ex.name}</Text>
        <Text style={styles.exSummary}>{summary}</Text>
        <TouchableOpacity style={[styles.exCheck, done && styles.exCheckDone]} onPress={onToggleDone}>
          {done && <Text style={{fontSize:9, color:'#fca5a5', fontWeight:'900'}}>✓</Text>}
        </TouchableOpacity>
      </TouchableOpacity>

      {open && (
        <View style={styles.exBody}>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder={placeholder}
            placeholderTextColor={colors.dim}
            value={exData.notes || ''}
            onChangeText={onNotesChange}
          />
          <TouchableOpacity style={[styles.exDoneBtn, done && styles.exDoneBtnActive]} onPress={onToggleDone}>
            <Text style={[styles.exDoneBtnText, done && styles.exDoneBtnTextActive]}>
              {done ? '✓ Выполнено (снять)' : 'Отметить выполненным ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function HistSession({ sess }) {
  const [open, setOpen] = useState(false);
  const doneCount = EXERCISES.filter(ex => sess.exercises[ex.id]?.done).length;
  return (
    <View style={styles.histSess}>
      <TouchableOpacity style={styles.histSessHead} onPress={() => setOpen(o => !o)}>
        <View>
          <Text style={styles.histSessDate}>{fmtDate(sess.date.split('-').slice(0,3).join('-'))}</Text>
          <Text style={styles.histSessMeta}>{doneCount} упражн{sess.exercises['run']?.minutes ? ' · ' + sess.exercises['run'].minutes + ' мин' : ''}{sess.exercises['run']?.km ? ' · ' + sess.exercises['run'].km + ' км' : ''}</Text>
        </View>
        <Text style={{color: colors.dim, fontSize:11}}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.histSessBody}>
          {EXERCISES.map(ex => {
            const d = sess.exercises[ex.id];
            if (!d) return null;
            let val = '';
            if (ex.type === 'cardio') {
              const parts = [];
              if (d.minutes) parts.push(d.minutes + ' мин');
              if (d.km) parts.push(d.km + ' км');
              val = parts.join(' · ');
            } else {
              val = d.notes ? d.notes.split('\n')[0].slice(0, 30) : '';
            }
            if (!val && !d.done) return null;
            return (
              <View key={ex.id} style={styles.histExRow}>
                <Text style={styles.histExName}>{ex.em} {ex.name}</Text>
                <Text style={styles.histExVal}>{val || (d.done ? '✓' : '')}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.bg },
  dimText: { color: colors.dim, fontSize:10, fontFamily:'monospace' },
  header: { flexDirection:'row', alignItems:'center', gap:10, padding:12, borderBottomWidth:1, borderBottomColor: colors.border },
  back: { width:34, height:34, borderRadius:9, borderWidth:1, borderColor: colors.border2, alignItems:'center', justifyContent:'center' },
  backText: { color: colors.text, fontSize:16 },
  headerInfo: { flex:1 },
  headerSub: { fontSize:7, letterSpacing:3, color:'#ef4444', textTransform:'uppercase', fontFamily:'monospace' },
  headerName: { fontSize:20, color:'#fff', fontWeight:'900', letterSpacing:1 },
  sessBar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:8, paddingHorizontal:14, borderBottomWidth:1, borderBottomColor: colors.border },
  sessDate: { fontSize:9, color: colors.dim, letterSpacing:0.5, fontFamily:'monospace' },
  sbtn: { borderRadius:8, borderWidth:1, borderColor: colors.border, paddingHorizontal:10, paddingVertical:5 },
  sbtnNew: { borderColor:'rgba(239,68,68,.3)', backgroundColor:'rgba(239,68,68,.08)' },
  sbtnText: { fontSize:8, color: colors.dim, fontFamily:'monospace', fontWeight:'600' },
  runCard: { flexDirection:'row', alignItems:'center', gap:8, padding:10, paddingHorizontal:14, borderBottomWidth:1, borderBottomColor: colors.border, backgroundColor:'rgba(239,68,68,.03)' },
  runIcon: { fontSize:18 },
  runLabel: { fontSize:11, color: colors.text, fontWeight:'700', flex:1 },
  runInput: { backgroundColor:'rgba(255,255,255,.04)', borderWidth:1, borderColor: colors.border, borderRadius:9, color:'#fca5a5', fontFamily:'monospace', fontSize:16, fontWeight:'700', width:64, textAlign:'center', padding:6 },
  runUnit: { fontSize:10, color: colors.dim },
  doneCount: { fontSize:8, color: colors.dim, fontFamily:'monospace', marginLeft:4 },
  scroll: { flex:1, paddingHorizontal:12, paddingTop:8 },
  exCard: { borderWidth:1, borderColor: colors.border, borderRadius:14, marginBottom:8, overflow:'hidden' },
  exCardDone: { borderColor:'rgba(239,68,68,.35)' },
  exHeader: { flexDirection:'row', alignItems:'center', gap:10, padding:10, paddingHorizontal:12 },
  exNum: { width:22, height:22, borderRadius:6, backgroundColor:'rgba(239,68,68,.08)', borderWidth:1, borderColor:'rgba(239,68,68,.2)', alignItems:'center', justifyContent:'center' },
  exNumDone: { backgroundColor:'rgba(239,68,68,.22)', borderColor:'rgba(239,68,68,.5)' },
  exNumText: { fontSize:9, fontWeight:'700', color:'#fca5a5', fontFamily:'monospace' },
  exName: { flex:1, fontSize:11, fontWeight:'600', color: colors.text, letterSpacing:0.3 },
  exNameDone: { color:'#fca5a5' },
  exSummary: { fontSize:8, color: colors.dim, maxWidth:80 },
  exCheck: { width:20, height:20, borderRadius:10, borderWidth:1.5, borderColor: colors.border2, alignItems:'center', justifyContent:'center' },
  exCheckDone: { backgroundColor:'rgba(239,68,68,.18)', borderColor:'rgba(239,68,68,.5)' },
  exBody: { paddingHorizontal:12, paddingBottom:12, borderTopWidth:1, borderTopColor: colors.border },
  notesInput: { backgroundColor:'rgba(255,255,255,.03)', borderWidth:1, borderColor: colors.border, borderRadius:10, color: colors.text, fontFamily:'monospace', fontSize:10, padding:10, marginTop:10, minHeight:68, lineHeight:16, textAlignVertical:'top' },
  exDoneBtn: { marginTop:10, borderWidth:1, borderRadius:10, padding:10, backgroundColor:'rgba(239,68,68,.06)', borderColor:'rgba(239,68,68,.25)' },
  exDoneBtnActive: { backgroundColor:'rgba(34,197,94,.06)', borderColor:'rgba(34,197,94,.25)' },
  exDoneBtnText: { textAlign:'center', color:'#fca5a5', fontSize:10, fontFamily:'monospace', fontWeight:'600', letterSpacing:0.5 },
  exDoneBtnTextActive: { color:'#86efac' },
  histHeader: { flexDirection:'row', alignItems:'center', gap:12, padding:14, borderBottomWidth:1, borderBottomColor: colors.border },
  histTitle: { fontSize:18, color:'#fff', fontWeight:'900', letterSpacing:1 },
  histSess: { borderWidth:1, borderColor: colors.border, borderRadius:12, marginBottom:10, overflow:'hidden', marginHorizontal:2 },
  histSessHead: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:10, paddingHorizontal:12, backgroundColor:'rgba(239,68,68,.04)' },
  histSessDate: { fontSize:10, color:'#fca5a5', fontWeight:'600', letterSpacing:0.5 },
  histSessMeta: { fontSize:8, color: colors.dim, marginTop:2, fontFamily:'monospace' },
  histSessBody: { padding:10, paddingHorizontal:12 },
  histExRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:4, borderBottomWidth:1, borderBottomColor: colors.border },
  histExName: { fontSize:10, color: colors.text },
  histExVal: { fontSize:9, color: colors.dim, fontFamily:'monospace' },
});
