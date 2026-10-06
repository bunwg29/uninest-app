import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { THEME_COLORS } from '@theme';

export interface ListingLocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export const ListingLocationMap = ({
  latitude,
  longitude,
  title,
  description,
}: ListingLocationMapProps) => (
  <MapView
    style={styles.map}
    initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
    scrollEnabled={false}
    zoomEnabled={false}
    rotateEnabled={false}
    pitchEnabled={false}
  >
    <Marker
      coordinate={{ latitude, longitude }}
      title={title}
      description={description}
      pinColor={THEME_COLORS.PRIMARY}
    />
  </MapView>
);

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
});
