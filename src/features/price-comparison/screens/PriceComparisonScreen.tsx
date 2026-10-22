import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useComparison } from '@features/comparison';
import { ROOM_TYPE_OPTIONS } from '@features/listings';
import type { RootStackParamList } from '@navigation';
import { SPACING_TOKENS } from '@theme';
import { HeaderBar, ScreenContainer } from '@ui';
import {
  InsufficientPriceData,
  NearbyPriceAreas,
  PriceComparisonError,
  PriceComparisonPickerSheet,
  PriceComparisonPrompt,
  PriceComparisonSelect,
  PriceComparisonSkeleton,
  PriceRangeChart,
} from '../components';
import { usePriceComparison, usePriceComparisonProvinces, usePriceComparisonWards } from '../hooks';
import type { PriceComparisonPickerOption } from '../components';
import type { PriceComparisonRoomType } from '../types';
import { getInterestedPriceMarkers, hasSufficientPriceData } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PriceComparison'>;
type PickerKind = 'province' | 'ward' | 'roomType' | null;

const DEFAULT_ROOM_TYPE: PriceComparisonRoomType = 'phong_tro';

export const PriceComparisonScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { items: comparedListings } = useComparison();
  const [pickerKind, setPickerKind] = useState<PickerKind>(null);
  const [provinceCode, setProvinceCode] = useState<string>();
  const [wardCode, setWardCode] = useState<string>();
  const [roomType, setRoomType] = useState<PriceComparisonRoomType>(DEFAULT_ROOM_TYPE);

  const provincesQuery = usePriceComparisonProvinces();
  const wardsQuery = usePriceComparisonWards(provinceCode);
  const selectedQuery = usePriceComparison(
    { areaLevel: 'ward', provinceCode, wardCode, roomType, page: 1, limit: 20 },
    Boolean(provinceCode && wardCode)
  );
  const nearbyQuery = usePriceComparison(
    { areaLevel: 'ward', provinceCode, roomType, page: 1, limit: 100 },
    Boolean(provinceCode && wardCode)
  );

  const selectedProvince = provincesQuery.data?.find((item) => item.code === provinceCode);
  const selectedWard = wardsQuery.data?.find((item) => item.code === wardCode);
  const selectedRoomType = ROOM_TYPE_OPTIONS.find((item) => item.value === roomType);
  const selectedItem = selectedQuery.data?.items.find((item) => item.areaCode === wardCode);
  const nearbyItems = useMemo(
    () =>
      (nearbyQuery.data?.items ?? [])
        .filter((item) => item.areaCode !== wardCode && hasSufficientPriceData(item))
        .slice(0, 3),
    [nearbyQuery.data?.items, wardCode]
  );
  const interestedMarkers = useMemo(
    () => (wardCode ? getInterestedPriceMarkers(comparedListings, wardCode, roomType) : []),
    [comparedListings, roomType, wardCode]
  );

  const provinceOptions = (provincesQuery.data ?? []).map((item) => ({
    label: item.fullName,
    value: item.code,
  }));
  const wardOptions = [
    { label: 'Đổi tỉnh/thành phố', value: '__change_province__' },
    ...(wardsQuery.data ?? []).map((item) => ({
      label: item.fullName,
      value: item.code,
    })),
  ];
  const roomTypeOptions: PriceComparisonPickerOption[] = ROOM_TYPE_OPTIONS.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  const selectProvince = (option: PriceComparisonPickerOption) => {
    setProvinceCode(option.value);
    setWardCode(undefined);
    setPickerKind(null);
  };

  const selectWard = (option: PriceComparisonPickerOption) => {
    if (option.value === '__change_province__') {
      setPickerKind('province');
      return;
    }

    setWardCode(option.value);
    setPickerKind(null);
  };

  const selectRoomType = (option: PriceComparisonPickerOption) => {
    const nextRoomType = ROOM_TYPE_OPTIONS.find((item) => item.value === option.value)?.value;
    if (nextRoomType) setRoomType(nextRoomType);
    setPickerKind(null);
  };

  const selectNearbyArea = (areaCode: string) => {
    setWardCode(areaCode);
  };

  const refresh = () => {
    if (wardCode) {
      void Promise.all([selectedQuery.refetch(), nearbyQuery.refetch()]);
    }
  };

  return (
    <ScreenContainer
      scrollable
      padding="none"
      contentContainerStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={selectedQuery.isRefetching || nearbyQuery.isRefetching}
          onRefresh={refresh}
        />
      }
    >
      <HeaderBar title="So sánh giá khu vực" onBack={navigation.goBack} />

      <View style={styles.content}>
        <View style={styles.filters}>
          <PriceComparisonSelect
            label="Khu vực"
            value={
              selectedProvince
                ? `${selectedProvince.name}${selectedWard ? ` · ${selectedWard.name}` : ' · Chọn phường/xã'}`
                : undefined
            }
            placeholder="Chọn tỉnh/thành"
            onPress={() => setPickerKind(provinceCode ? 'ward' : 'province')}
          />
          <PriceComparisonSelect
            label="Loại phòng"
            value={selectedRoomType?.label}
            placeholder="Chọn loại phòng"
            onPress={() => setPickerKind('roomType')}
          />
        </View>

        {!wardCode ? (
          <PriceComparisonPrompt />
        ) : selectedQuery.isPending ? (
          <PriceComparisonSkeleton />
        ) : selectedQuery.isError ? (
          <PriceComparisonError onRetry={() => void selectedQuery.refetch()} />
        ) : selectedItem && hasSufficientPriceData(selectedItem) ? (
          <PriceRangeChart item={selectedItem} interestedMarkers={interestedMarkers} />
        ) : (
          <InsufficientPriceData sampleCount={selectedItem?.sampleCount ?? 0} />
        )}

        {selectedProvince ? (
          <NearbyPriceAreas
            items={nearbyItems}
            provinceName={selectedProvince.name}
            onSelect={selectNearbyArea}
          />
        ) : null}
      </View>

      <PriceComparisonPickerSheet
        isVisible={pickerKind === 'province'}
        title="Chọn tỉnh/thành"
        options={provinceOptions}
        selectedValue={provinceCode}
        emptyMessage="Không có dữ liệu tỉnh/thành"
        searchPlaceholder="Tìm tỉnh/thành phố..."
        isLoading={provincesQuery.isPending}
        isError={provincesQuery.isError}
        onRetry={() => void provincesQuery.refetch()}
        onSelect={selectProvince}
        onClose={() => setPickerKind(null)}
      />
      <PriceComparisonPickerSheet
        isVisible={pickerKind === 'ward'}
        title="Chọn phường/xã"
        options={wardOptions}
        selectedValue={wardCode}
        emptyMessage="Không có dữ liệu phường/xã"
        searchPlaceholder="Tìm phường/xã..."
        isLoading={wardsQuery.isPending}
        isError={wardsQuery.isError}
        onRetry={() => void wardsQuery.refetch()}
        onSelect={selectWard}
        onClose={() => setPickerKind(null)}
      />
      <PriceComparisonPickerSheet
        isVisible={pickerKind === 'roomType'}
        title="Chọn loại phòng"
        options={roomTypeOptions}
        selectedValue={roomType}
        emptyMessage="Không có loại phòng"
        onSelect={selectRoomType}
        onClose={() => setPickerKind(null)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: { paddingBottom: SPACING_TOKENS.XL },
  content: { gap: 14, padding: SPACING_TOKENS.MD },
  filters: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
});
