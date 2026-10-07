import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { MapPin, ChevronDown, Search } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS } from '@theme';
import { Button, Typography, ScreenContainer, Modal, Input, KeyboardAwareScrollView } from '@ui';
import { useToast } from '@hooks';
import type { ListingPostStackParamList } from '@navigation';
import {
  locationsService,
  type LocationProvince,
  type LocationWard,
} from '@features/auth/services/locationsService';
import { useListingPostStore } from '../store/listingPostStore';
import { WizardHeader } from '../components/landlord/WizardHeader';
import { LocationMap, type MapCoordinate } from '../components/LocationMap';

type NavigationProp = NativeStackNavigationProp<ListingPostStackParamList>;

const DEFAULT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const LocationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { step3, setStep3, editingListingId } = useListingPostStore();

  const [streetAddress, setStreetAddress] = useState(step3.streetAddress);
  const [selectedProvince, setSelectedProvince] = useState<LocationProvince | null>(
    step3.provinceCode
      ? {
          code: step3.provinceCode,
          name: step3.provinceName,
          fullName: step3.provinceName,
          codeName: '',
        }
      : null
  );
  const [selectedWard, setSelectedWard] = useState<LocationWard | null>(
    step3.wardCode
      ? {
          code: step3.wardCode,
          name: step3.wardName,
          fullName: step3.wardName,
          codeName: '',
          provinceCode: step3.provinceCode,
        }
      : null
  );

  const [markerCoord, setMarkerCoord] = useState<{ latitude: number; longitude: number } | null>(
    step3.latitude !== null && step3.longitude !== null
      ? { latitude: step3.latitude, longitude: step3.longitude }
      : null
  );

  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [isWardModalVisible, setIsWardModalVisible] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProvinces = async () => {
      try {
        setIsLoadingProvinces(true);
        const data = await locationsService.getProvinces();

        if (isMounted) setProvinces(data);
      } catch {
        if (isMounted) toast.error('Không thể tải danh sách tỉnh/thành phố');
      } finally {
        if (isMounted) setIsLoadingProvinces(false);
      }
    };

    void loadProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProvince = useCallback(
    async (province: LocationProvince) => {
      setSelectedProvince(province);
      setSelectedWard(null);
      setIsProvinceModalVisible(false);
      setProvinceSearch('');

      try {
        setIsLoadingWards(true);
        const wardsData = await locationsService.getWardsByProvince(province.code);

        setWards(wardsData);
      } catch {
        toast.error('Không thể tải danh sách phường/xã');
      } finally {
        setIsLoadingWards(false);
      }
    },
    [toast]
  );

  const handleSelectWard = useCallback((ward: LocationWard) => {
    setSelectedWard(ward);
    setIsWardModalVisible(false);
    setWardSearch('');
  }, []);

  const handleCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        toast.info('Không có quyền truy cập vị trí. Vui lòng cấp quyền trong Cài đặt thiết bị.');

        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coord = { latitude: location.coords.latitude, longitude: location.coords.longitude };

      setMarkerCoord(coord);
      toast.success('Đã lấy vị trí hiện tại');
    } catch {
      toast.error('Không thể lấy vị trí hiện tại. Vui lòng chạm vào bản đồ để chọn.');
    }
  }, [toast]);

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) return provinces;

    const kw = provinceSearch.toLowerCase();

    return provinces.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.fullName.toLowerCase().includes(kw)
    );
  }, [provinces, provinceSearch]);

  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) return wards;

    const kw = wardSearch.toLowerCase();

    return wards.filter(
      (w) => w.name.toLowerCase().includes(kw) || w.fullName.toLowerCase().includes(kw)
    );
  }, [wards, wardSearch]);

  const canContinue =
    streetAddress.trim().length > 0 &&
    selectedProvince !== null &&
    selectedWard !== null &&
    markerCoord !== null;

  const handleContinue = useCallback(() => {
    if (!selectedProvince) {
      toast.error('Vui lòng chọn Tỉnh/Thành phố');

      return;
    }

    if (!selectedWard) {
      toast.error('Vui lòng chọn Phường/Xã');

      return;
    }

    if (!streetAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ đường phố');

      return;
    }

    if (!markerCoord) {
      Alert.alert(
        'Chưa chọn vị trí',
        'Vui lòng nhấn vào bản đồ để chọn vị trí chính xác của phòng.',
        [{ text: 'Đồng ý' }]
      );

      return;
    }

    setStep3({
      streetAddress: streetAddress.trim(),
      provinceCode: selectedProvince.code,
      provinceName: selectedProvince.fullName,
      wardCode: selectedWard.code,
      wardName: selectedWard.fullName,
      latitude: markerCoord.latitude,
      longitude: markerCoord.longitude,
    });

    navigation.navigate('ListingPostAmenities');
  }, [selectedProvince, selectedWard, streetAddress, markerCoord, setStep3, navigation, toast]);

  const renderSelector = ({
    label,
    value,
    placeholder,
    isLoading,
    isDisabled = false,
    onPress,
  }: {
    label: string;
    value?: string;
    placeholder: string;
    isLoading: boolean;
    isDisabled?: boolean;
    onPress: () => void;
  }) => (
    <View style={styles.halfField}>
      <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_PRIMARY" style={styles.label}>
        {label}
      </Typography>

      <TouchableOpacity
        style={[styles.selector, isDisabled && styles.selectorDisabled]}
        onPress={onPress}
        activeOpacity={isDisabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Typography
          variant="body2"
          color={value ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
          style={styles.selectorText}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Typography>

        {isLoading ? (
          <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
        ) : (
          <ChevronDown size={16} color={THEME_COLORS.TEXT_MUTED} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer applyTopInset applyBottomInset keyboardAvoiding={false}>
      <WizardHeader step={3} isEditing={Boolean(editingListingId)} onBack={navigation.goBack} />

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Địa chỉ"
          placeholder="Số nhà, tên đường"
          value={streetAddress}
          onChangeText={setStreetAddress}
          leftIcon={<MapPin size={18} color={THEME_COLORS.TEXT_MUTED} />}
          idleBorderColor={OVERLAY_COLORS.FIELD_BORDER}
          containerStyle={styles.streetInput}
          inputContainerStyle={styles.streetField}
        />

        <View style={styles.fieldRow}>
          {renderSelector({
            label: 'Tỉnh/Thành phố',
            value: selectedProvince?.name,
            placeholder: 'Chọn tỉnh',
            isLoading: isLoadingProvinces,
            onPress: () => setIsProvinceModalVisible(true),
          })}

          {renderSelector({
            label: 'Phường/Xã',
            value: selectedWard?.name,
            placeholder: 'Chọn phường',
            isLoading: isLoadingWards,
            isDisabled: !selectedProvince,
            onPress: () => {
              if (!selectedProvince) {
                toast.info('Vui lòng chọn Tỉnh/Thành phố trước');

                return;
              }

              setIsWardModalVisible(true);
            },
          })}
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_PRIMARY">
              Kéo ghim tới đúng vị trí
            </Typography>

            <TouchableOpacity
              style={styles.locationBtn}
              onPress={handleCurrentLocation}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Dùng vị trí hiện tại"
            >
              <Typography variant="label" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                Dùng vị trí hiện tại
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.mapFrame}>
            <LocationMap
              coordinate={markerCoord}
              defaultRegion={DEFAULT_REGION}
              onCoordinateChange={(coordinate: MapCoordinate) => setMarkerCoord(coordinate)}
            />
          </View>

          <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.mapHint}>
            {markerCoord
              ? `Toạ độ đã chọn: ${markerCoord.latitude.toFixed(6)}, ${markerCoord.longitude.toFixed(6)}. Kéo ghim hoặc chạm vào bản đồ để tinh chỉnh.`
              : 'Chạm vào bản đồ hoặc bấm "Dùng vị trí hiện tại" để ghim vị trí phòng.'}
          </Typography>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onPress={handleContinue}
        >
          Tiếp tục
        </Button>
      </View>

      <Modal
        isVisible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        title="Chọn Tỉnh / Thành phố"
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm..."
            value={provinceSearch}
            onChangeText={setProvinceSearch}
            leftIcon={<Search size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            containerStyle={styles.searchInput}
          />

          {isLoadingProvinces ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
            </View>
          ) : (
            <FlatList
              data={filteredProvinces}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = selectedProvince?.code === item.code;

                return (
                  <TouchableOpacity
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => handleSelectProvince(item)}
                    activeOpacity={0.7}
                  >
                    <Typography
                      variant="body1"
                      weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                      color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
                    >
                      {item.fullName}
                    </Typography>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Không tìm thấy tỉnh/thành phố
                  </Typography>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      <Modal
        isVisible={isWardModalVisible}
        onClose={() => setIsWardModalVisible(false)}
        title={`Chọn Phường/Xã (${selectedProvince?.name ?? ''})`}
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm..."
            value={wardSearch}
            onChangeText={setWardSearch}
            leftIcon={<Search size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            containerStyle={styles.searchInput}
          />

          {isLoadingWards ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={THEME_COLORS.PRIMARY} />
            </View>
          ) : (
            <FlatList
              data={filteredWards}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = selectedWard?.code === item.code;

                return (
                  <TouchableOpacity
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => handleSelectWard(item)}
                    activeOpacity={0.7}
                  >
                    <Typography
                      variant="body1"
                      weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
                      color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
                    >
                      {item.fullName}
                    </Typography>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" colorKey="TEXT_MUTED">
                    Không tìm thấy phường/xã
                  </Typography>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: SPACING_TOKENS.XL, gap: 16 },
  streetInput: { marginBottom: 0 },
  streetField: { height: 52, borderRadius: BORDER_RADIUS_TOKENS.MD },
  fieldRow: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1, gap: 8 },
  label: { marginBottom: 0 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    gap: SPACING_TOKENS.XS,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectorDisabled: { backgroundColor: THEME_COLORS.SURFACE_MUTED, opacity: 0.7 },
  selectorText: { flex: 1 },
  mapSection: { gap: 10 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationBtn: { paddingVertical: 2 },
  mapFrame: {
    height: 232,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: OVERLAY_COLORS.MAP_LAND,
  },
  mapHint: { lineHeight: 18 },
  bottomBar: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
  modal: {
    maxHeight: '85%',
  },
  modalBody: {
    maxHeight: 450,
  },
  searchInput: {
    marginBottom: SPACING_TOKENS.SM,
  },
  modalLoading: {
    paddingVertical: SPACING_TOKENS.XL,
    alignItems: 'center',
  },
  list: {
    maxHeight: 360,
  },
  listItem: {
    paddingVertical: SPACING_TOKENS.SM + 2,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  listItemSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  emptyList: {
    paddingVertical: SPACING_TOKENS.LG,
    alignItems: 'center',
  },
});
