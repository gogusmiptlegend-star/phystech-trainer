import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../src/theme';
import { SUBJECTS, getSemOrder } from '../../src/data';
import { getStudyState, nodeKey } from '../../src/storage';

function useProgress() {
  const [progressMap, setProgressMap] = useState({});
  useFocusEffect(useCallback(() => {
    getStudyState().then(state => setProgressMap(state));
  }, []));
  return progressMap;
}

function computeDone(subject, state) {
  let done = 0, total = 0;
  subject.lanes.forEach(lane => {
    lane.nodes.forEach((n, ni) => {
      total++;
      if (state[nodeKey(subject.id, lane.id, ni)]) done++;
    });
  });
  return { done, total };
}

export default function StudyScreen() {
  const router = useRouter();
  const progressMap = useProgress();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.eyebrow}>// STUDY TECH TREE</Text>
          <Text style={styles.title}>ДИСЦИПЛИНЫ</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {SUBJECTS.map(s => {
          const { done, total } = computeDone(s, progressMap);
          const pct = total ? Math.round(done / total * 100) : 0;
          return (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/study/tree', params: { id: s.id } })}
            >
              <View style={[styles.cardAccent, { backgroundColor: s.color }]} />
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View style={[styles.cardEmoji, { borderColor: s.color + '33' }]}>
                    <Text style={styles.cardEmojiText}>{s.emoji}</Text>
                  </View>
                  <View>
                    <Text style={[styles.cardName, { color: s.color }]}>{s.name}</Text>
                    <Text style={styles.cardSchools}>{s.schools}</Text>
                  </View>
                </View>
                <Text style={[styles.cardArrow, { color: s.color }]}>▶</Text>
              </View>
              <View style={styles.barRow}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: s.color }]} />
                </View>
                <Text style={styles.barLabel}>{done}/{total} · {pct}%</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.bg },
  header: { flexDirection:'row', alignItems:'center', gap:12, padding:14, paddingTop:16, borderBottomWidth:1, borderBottomColor: colors.border },
  back: { width:36, height:36, borderRadius:9, borderWidth:1, borderColor: colors.border2, alignItems:'center', justifyContent:'center' },
  backText: { color: colors.text, fontSize:18 },
  eyebrow: { fontSize:7, letterSpacing:3, color: colors.dim, textTransform:'uppercase', fontFamily:'monospace' },
  title: { fontSize:22, color:'#fff', letterSpacing:2, fontWeight:'900' },
  scroll: { flex:1, paddingHorizontal:14, paddingTop:8 },
  card: {
    borderWidth:1, borderColor: colors.border, borderRadius:14,
    marginBottom:10, padding:14, backgroundColor: colors.surface,
    overflow:'hidden', position:'relative',
  },
  cardAccent: { position:'absolute', left:0, top:0, bottom:0, width:3, borderRadius:3 },
  cardTop: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  cardLeft: { flexDirection:'row', alignItems:'center', gap:11 },
  cardEmoji: { width:40, height:40, borderRadius:10, borderWidth:1, alignItems:'center', justifyContent:'center' },
  cardEmojiText: { fontSize:20 },
  cardName: { fontSize:18, fontWeight:'900', letterSpacing:1 },
  cardSchools: { fontSize:7, color: colors.dim, marginTop:2, letterSpacing:0.5, fontFamily:'monospace' },
  cardArrow: { fontSize:12 },
  barRow: { flexDirection:'row', alignItems:'center', gap:8, marginTop:11 },
  barTrack: { flex:1, height:3, backgroundColor:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden' },
  barFill: { height:'100%', borderRadius:2 },
  barLabel: { fontSize:8, color: colors.dim, fontFamily:'monospace' },
});
