import MapView, { Marker, type MapPressEvent } from 'react-native-maps';
import { StyleSheet } from 'react-native';
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
}: LocationMapProps) => {
  const handleMapPress = (event: MapPressEvent) => {
    onCoordinateChange(event.nativeEvent.coordinate);
  };

  return (
    <MapView
      style={styles.map}
      region={
        coordinate ? { ...coordinate, latitudeDelta: 0.01, longitudeDelta: 0.01 } : defaultRegion
      }
      onPress={handleMapPress}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass
      loadingEnabled
      loadingIndicatorColor={THEME_COLORS.PRIMARY}
      loadingBackgroundColor={THEME_COLORS.SURFACE}
    >
      {coordinate ? (
        <Marker
          coordinate={coordinate}
          pinColor={THEME_COLORS.PRIMARY}
          draggable
          onDragEnd={(event) => onCoordinateChange(event.nativeEvent.coordinate)}
          title="Vị trí phòng trọ"
          description="Kéo thả marker để chọn vị trí chính xác"
        />
      ) : null}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 220 },
});
