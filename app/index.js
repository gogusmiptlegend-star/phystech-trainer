import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>// МФТИ ТРЕКЕР</Text>
          <Text style={styles.title}>PHYSTECH{'\n'}TRAINER</Text>
          <Text style={styles.sub}>Выбери путь развития</Text>
        </View>

        <View style={styles.divider} />

        {/* Buttons */}
        <View style={styles.btns}>

          {/* Fire — coming soon */}
          <TouchableOpacity
            style={[styles.btn, styles.btnFire]}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View style={[styles.btnIcon, styles.btnIconFire]}>
              <Text style={styles.btnEmoji}>🔥</Text>
            </View>
            <View style={styles.btnText}>
              <Text style={[styles.btnLabel, { color: '#fca5a5' }]}>Физическая подготовка</Text>
              <Text style={[styles.btnDesc, { color: 'rgba(239,68,68,0.5)' }]}>ТРЕНИРОВКИ · СПОРТ · НОРМАТИВЫ</Text>
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>СКОРО</Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: 'rgba(239,68,68,0.4)' }]}>→</Text>
          </TouchableOpacity>

          {/* Ocean — gym */}
          <TouchableOpacity
            style={[styles.btn, styles.btnGym]}
            activeOpacity={0.8}
            onPress={() => router.push('/gym')}
          >
            <View style={[styles.btnIcon, styles.btnIconGym]}>
              <Text style={styles.btnEmoji}>💪</Text>
            </View>
            <View style={styles.btnText}>
              <Text style={[styles.btnLabel, { color: '#fca5a5' }]}>Зал</Text>
              <Text style={[styles.btnDesc, { color: 'rgba(239,68,68,0.45)' }]}>УПРАЖНЕНИЯ · ПРОГРЕСС · ИСТОРИЯ</Text>
            </View>
            <Text style={[styles.arrow, { color: 'rgba(239,68,68,0.4)' }]}>→</Text>
          </TouchableOpacity>

          {/* Ocean — study */}
          <TouchableOpacity
            style={[styles.btn, styles.btnOcean]}
            activeOpacity={0.8}
            onPress={() => router.push('/study')}
          >
            <View style={[styles.btnIcon, styles.btnIconOcean]}>
              <Text style={styles.btnEmoji}>🌊</Text>
            </View>
            <View style={styles.btnText}>
              <Text style={[styles.btnLabel, { color: '#7dd3fc' }]}>Учебный план</Text>
              <Text style={[styles.btnDesc, { color: 'rgba(56,189,248,0.45)' }]}>ПРЕДМЕТЫ · ПРОГРЕСС · ДЕРЕВО ЗНАНИЙ</Text>
            </View>
            <Text style={[styles.arrow, { color: 'rgba(56,189,248,0.4)' }]}>→</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.homePill} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.bg },
  container: { flex:1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  hero: { flex:1, justifyContent:'center', alignItems:'center' },
  eyebrow: { fontSize:11, letterSpacing:5, color: colors.dim, textTransform:'uppercase', marginBottom:8, fontFamily:'monospace' },
  title: { fontSize:56, lineHeight:52, color:'#fff', textAlign:'center', letterSpacing:3, fontWeight:'900' },
  sub: { fontSize:10, color: colors.dim, letterSpacing:3, marginTop:12, textTransform:'uppercase', fontFamily:'monospace' },
  divider: { height:1, backgroundColor: colors.border2, marginVertical:28, marginHorizontal:12 },
  btns: { gap:12, paddingBottom:16 },
  btn: {
    borderRadius:18, borderWidth:1, padding:18,
    flexDirection:'row', alignItems:'center', gap:14,
  },
  btnFire: { backgroundColor:'rgba(239,68,68,0.06)', borderColor:'rgba(239,68,68,0.25)' },
  btnGym:  { backgroundColor:'rgba(239,68,68,0.06)', borderColor:'rgba(239,68,68,0.25)' },
  btnOcean:{ backgroundColor:'rgba(56,189,248,0.06)', borderColor:'rgba(56,189,248,0.25)' },
  btnIcon: { width:52, height:52, borderRadius:14, alignItems:'center', justifyContent:'center', borderWidth:1 },
  btnIconFire: { backgroundColor:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.2)' },
  btnIconGym:  { backgroundColor:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.2)' },
  btnIconOcean:{ backgroundColor:'rgba(56,189,248,0.08)', borderColor:'rgba(56,189,248,0.18)' },
  btnEmoji: { fontSize:24 },
  btnText: { flex:1 },
  btnLabel: { fontSize:16, fontWeight:'700', letterSpacing:1 },
  btnDesc: { fontSize:8, letterSpacing:0.5, marginTop:3, fontFamily:'monospace' },
  arrow: { fontSize:18 },
  soonBadge: {
    marginTop:5, alignSelf:'flex-start',
    backgroundColor:'rgba(239,68,68,0.12)',
    borderRadius:20, borderWidth:1, borderColor:'rgba(239,68,68,0.2)',
    paddingHorizontal:7, paddingVertical:2,
  },
  soonText: { fontSize:7, letterSpacing:1.5, color:'rgba(239,68,68,0.6)', fontFamily:'monospace' },
  homePill: { width:130, height:4, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:2, alignSelf:'center', marginBottom:12 },
});
