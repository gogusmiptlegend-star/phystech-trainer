import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Modal, Pressable
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { colors } from '../../src/theme';
import { SUBJECTS, getSemOrder, semLabel, getFullName } from '../../src/data';
import { getStudyState, setStudyState, nodeKey } from '../../src/storage';

export default function TreeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const subject = SUBJECTS.find(s => s.id === id);
  const [state, setState] = useState({});
  const [modal, setModal] = useState(null); // {lane, li, ni, node, status}

  useEffect(() => { getStudyState().then(setState); }, []);

  if (!subject) return null;

  function getStatus(laneId, laneNodes, ni) {
    // Group by semester
    const groups = [];
    laneNodes.forEach((n, i) => {
      const sem = getSemOrder(n.sub);
      const last = groups[groups.length - 1];
      if (last && last.sem === sem) last.indices.push(i);
      else groups.push({ sem, indices: [i] });
    });
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      if (!g.indices.includes(ni)) continue;
      if (gi === 0) {
        return state[nodeKey(id, laneId, ni)] ? 'done' : 'progress';
      }
      const prev = groups[gi - 1];
      const prevDone = prev.indices.every(i => state[nodeKey(id, laneId, i)]);
      if (prevDone) return state[nodeKey(id, laneId, ni)] ? 'done' : 'progress';
      return 'locked';
    }
    return 'locked';
  }

  async function toggleDone(laneId, ni, currentStatus) {
    if (currentStatus === 'locked') return;
    const k = nodeKey(id, laneId, ni);
    const newState = { ...state };
    if (currentStatus === 'done') delete newState[k];
    else newState[k] = 1;
    setState(newState);
    await setStudyState(newState);
    setModal(null);
  }

  // Stats
  let totalN = 0, doneN = 0;
  subject.lanes.forEach(lane => {
    lane.nodes.forEach((n, ni) => {
      totalN++;
      if (state[nodeKey(id, lane.id, ni)]) doneN++;
    });
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSub}>// TECH_TREE</Text>
          <Text style={styles.headerName}>{subject.name}</Text>
        </View>
        <Text style={styles.headerEmoji}>{subject.emoji}</Text>
      </View>

      {/* Stats chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={styles.statsContent}>
        <View style={styles.chip}><View style={[styles.chipDot, {backgroundColor: colors.done}]}/><Text style={styles.chipText}>{doneN} сдано</Text></View>
        <View style={styles.chip}><View style={[styles.chipDot, {backgroundColor: colors.locked}]}/><Text style={styles.chipText}>{totalN - doneN} ожидает</Text></View>
        <View style={[styles.chip, {borderColor: subject.color + '44'}]}><Text style={[styles.chipText, {color: subject.color}]}>{subject.lanes.length} школ</Text></View>
      </ScrollView>

      {/* Lanes — horizontal scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.lanesScroll}>
        {subject.lanes.map((lane, li) => {
          let lastSem = null;
          return (
            <View key={lane.id} style={styles.lane}>
              {/* Lane header */}
              <View style={[styles.laneHead, {borderBottomColor: lane.color + '40'}]}>
                <Text style={[styles.laneHeadText, {color: lane.color}]}>{lane.name}</Text>
              </View>

              {/* Nodes */}
              <ScrollView showsVerticalScrollIndicator={false} style={styles.laneScroll}>
                {lane.nodes.map((node, ni) => {
                  const sem = getSemOrder(node.sub);
                  const showDiv = sem !== lastSem && lastSem !== null;
                  lastSem = sem;
                  const status = getStatus(lane.id, lane.nodes, ni);
                  return (
                    <View key={ni}>
                      {showDiv && (
                        <View style={styles.semDiv}>
                          <Text style={[styles.semDivText, {color: lane.color + '70'}]}>{semLabel(sem)}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.node, nodeStyle(status)]}
                        activeOpacity={0.75}
                        onPress={() => setModal({ lane, li, ni, node, status })}
                      >
                        {status === 'done' && <View style={[styles.badge, {backgroundColor: colors.done}]}><Text style={styles.badgeText}>✓</Text></View>}
                        {status === 'progress' && <View style={[styles.badge, {backgroundColor: colors.prog}]}><Text style={styles.badgeText}>▶</Text></View>}
                        <Text style={[styles.nodeEm, status === 'locked' && styles.lockedEm]}>{node.em}</Text>
                        <Text style={[styles.nodeLabel, nodeLabelStyle(status)]} numberOfLines={3}>{node.label}</Text>
                        <Text style={[styles.nodeSub, {color: lane.color + '88'}]} numberOfLines={1}>{node.sub}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <View style={{height:24}} />
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legItem}><View style={[styles.legSq, {backgroundColor:'rgba(34,197,94,.15)', borderColor:'rgba(34,197,94,.5)'}]}/><Text style={styles.legText}>Сдано</Text></View>
        <View style={styles.legItem}><View style={[styles.legSq, {backgroundColor:'rgba(245,158,11,.15)', borderColor:'rgba(245,158,11,.6)'}]}/><Text style={styles.legText}>В процессе</Text></View>
        <View style={styles.legItem}><View style={[styles.legSq, {backgroundColor:'rgba(255,255,255,.02)', borderColor:'#2a3d52'}]}/><Text style={styles.legText}>Предстоит</Text></View>
      </View>

      {/* Modal */}
      {modal && (
        <Modal transparent animationType="slide" onRequestClose={() => setModal(null)}>
          <Pressable style={styles.modalBg} onPress={() => setModal(null)}>
            <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalEmoji}>{modal.node.em}</Text>
              <Text style={styles.modalTitle}>{getFullName(modal.node.label)}</Text>
              <Text style={styles.modalSub}>{modal.lane.name}  ·  {modal.node.sub}</Text>

              {modal.status === 'progress' && (
                <TouchableOpacity style={styles.mbtnDone} onPress={() => toggleDone(modal.lane.id, modal.ni, 'progress')}>
                  <Text style={styles.mbtnDoneText}>✓  Отметить как пройденный</Text>
                </TouchableOpacity>
              )}
              {modal.status === 'done' && (
                <TouchableOpacity style={styles.mbtnUndone} onPress={() => toggleDone(modal.lane.id, modal.ni, 'done')}>
                  <Text style={styles.mbtnUndoneText}>✗  Отметить как непройденный</Text>
                </TouchableOpacity>
              )}
              {modal.status === 'locked' && (
                <View style={styles.lockedInfo}>
                  <Text style={styles.lockedInfoText}>🔒 Сначала заверши все предметы предыдущего семестра</Text>
                </View>
              )}

              <TouchableOpacity style={styles.mbtnCancel} onPress={() => setModal(null)}>
                <Text style={styles.mbtnCancelText}>Закрыть</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function nodeStyle(status) {
  if (status === 'done')     return styles.nodeDone;
  if (status === 'progress') return styles.nodeProg;
  return styles.nodeLocked;
}
function nodeLabelStyle(status) {
  if (status === 'done')     return styles.nodeLabelDone;
  if (status === 'progress') return styles.nodeLabelProg;
  return styles.nodeLabelLocked;
}

const LANE_W = 100;
const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.bg },
  header: { flexDirection:'row', alignItems:'center', gap:10, padding:12, borderBottomWidth:1, borderBottomColor: colors.border },
  back: { width:34, height:34, borderRadius:9, borderWidth:1, borderColor: colors.border2, alignItems:'center', justifyContent:'center' },
  backText: { color: colors.text, fontSize:16 },
  headerInfo: { flex:1 },
  headerSub: { fontSize:7, letterSpacing:3, color: colors.dim, textTransform:'uppercase', fontFamily:'monospace' },
  headerName: { fontSize:20, color:'#fff', fontWeight:'900', letterSpacing:1 },
  headerEmoji: { fontSize:26 },
  statsRow: { flexGrow:0, borderBottomWidth:1, borderBottomColor: colors.border },
  statsContent: { flexDirection:'row', gap:6, padding:7, paddingHorizontal:14 },
  chip: { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:9, paddingVertical:4, borderRadius:20, borderWidth:1, borderColor: colors.border },
  chipDot: { width:7, height:7, borderRadius:4 },
  chipText: { fontSize:8, color: colors.dim, fontFamily:'monospace' },
  lanesScroll: { flex:1 },
  lane: { width: LANE_W, borderRightWidth:1, borderRightColor: colors.border },
  laneHead: { padding:6, borderBottomWidth:1, alignItems:'center' },
  laneHeadText: { fontSize:7, fontWeight:'700', textTransform:'uppercase', letterSpacing:1, fontFamily:'monospace' },
  laneScroll: { flex:1, paddingHorizontal:3, paddingTop:8 },
  semDiv: { paddingVertical:4, borderTopWidth:1, borderTopColor: colors.border, marginBottom:4, alignItems:'center' },
  semDivText: { fontSize:5, letterSpacing:1, textTransform:'uppercase', fontFamily:'monospace' },
  node: { borderRadius:9, borderWidth:1, padding:6, marginBottom:6, alignItems:'center', position:'relative' },
  nodeDone:   { backgroundColor:'rgba(34,197,94,.06)',  borderColor:'rgba(34,197,94,.45)' },
  nodeProg:   { backgroundColor:'rgba(245,158,11,.07)', borderColor:'rgba(245,158,11,.55)' },
  nodeLocked: { backgroundColor:'rgba(255,255,255,.01)', borderColor:'#2a3d52' },
  badge: { position:'absolute', top:-4, right:-4, width:13, height:13, borderRadius:7, alignItems:'center', justifyContent:'center', zIndex:2 },
  badgeText: { fontSize:6, color:'#000', fontWeight:'900' },
  nodeEm: { fontSize:13, marginBottom:2 },
  lockedEm: { opacity:0.2 },
  nodeLabel: { fontSize:6, fontWeight:'700', letterSpacing:0.3, lineHeight:9, textAlign:'center' },
  nodeLabelDone:   { color:'#86efac' },
  nodeLabelProg:   { color:'#fcd34d' },
  nodeLabelLocked: { color:'#3a5470' },
  nodeSub: { fontSize:5, marginTop:2, opacity:0.55, textAlign:'center', fontFamily:'monospace' },
  legend: { flexDirection:'row', gap:12, padding:8, paddingHorizontal:16, borderTopWidth:1, borderTopColor: colors.border },
  legItem: { flexDirection:'row', alignItems:'center', gap:4 },
  legSq: { width:9, height:9, borderRadius:3, borderWidth:1 },
  legText: { fontSize:7.5, color: colors.dim, fontFamily:'monospace' },
  // Modal
  modalBg: { flex:1, backgroundColor:'rgba(0,0,0,0.75)', justifyContent:'flex-end' },
  modalSheet: { backgroundColor:'#0d1520', borderTopLeftRadius:26, borderTopRightRadius:26, paddingBottom:40, borderWidth:1, borderColor: colors.border2 },
  modalHandle: { width:40, height:4, backgroundColor: colors.border2, borderRadius:2, alignSelf:'center', marginTop:12, marginBottom:16 },
  modalEmoji: { fontSize:32, textAlign:'center', marginBottom:8 },
  modalTitle: { fontSize:22, color:'#fff', textAlign:'center', letterSpacing:1, fontWeight:'900', paddingHorizontal:24 },
  modalSub: { fontSize:9, color: colors.dim, textAlign:'center', marginTop:6, marginBottom:20, letterSpacing:0.5, fontFamily:'monospace' },
  mbtnDone: { marginHorizontal:18, borderRadius:14, borderWidth:1, padding:14, backgroundColor:'rgba(34,197,94,.12)', borderColor:'rgba(34,197,94,.4)', marginBottom:10 },
  mbtnDoneText: { color:'#86efac', textAlign:'center', fontSize:12, fontWeight:'700', fontFamily:'monospace' },
  mbtnUndone: { marginHorizontal:18, borderRadius:14, borderWidth:1, padding:14, backgroundColor:'rgba(255,68,68,.08)', borderColor:'rgba(255,68,68,.3)', marginBottom:10 },
  mbtnUndoneText: { color:'#fca5a5', textAlign:'center', fontSize:12, fontWeight:'700', fontFamily:'monospace' },
  lockedInfo: { marginHorizontal:18, padding:12, marginBottom:10 },
  lockedInfoText: { fontSize:9, color: colors.dim, textAlign:'center', letterSpacing:0.5, lineHeight:14, fontFamily:'monospace' },
  mbtnCancel: { marginHorizontal:18, borderRadius:14, borderWidth:1, padding:14, borderColor: colors.border },
  mbtnCancelText: { color: colors.dim, textAlign:'center', fontSize:11, fontFamily:'monospace' },
});
