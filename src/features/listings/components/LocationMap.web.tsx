import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { THEME_COLORS } from '@theme';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  coordinate: MapCoordinate | null;
  defaultRegion: MapCoordinate & { latitudeDelta: number; longitudeDelta: number };
  onCoordinateChange: (coordinate: MapCoordinate) => void;
}

export const LocationMap = ({
  coordinate,
  defaultRegion,
  onCoordinateChange,
}: LocationMapProps) => (
  <Pressable style={styles.map} onPress={() => onCoordinateChange(coordinate || defaultRegion)}>
    <View style={[styles.road, styles.horizontalRoad]} />
    <View style={[styles.road, styles.verticalRoad]} />
    <View style={[styles.road, styles.sideRoad]} />
    <View style={styles.pin}>
      <MapPin size={34} fill={THEME_COLORS.PRIMARY} color={THEME_COLORS.WHITE} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  map: {
    flex: 1,
    minHeight: 220,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4E8E0',
  },
  road: { position: 'absolute', backgroundColor: THEME_COLORS.SURFACE },
  horizontalRoad: { left: 0, right: 0, top: '55%', height: 10 },
  verticalRoad: { top: 0, bottom: 0, left: '47%', width: 8 },
  sideRoad: { top: 0, bottom: 0, left: '17%', width: 5 },
  pin: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
