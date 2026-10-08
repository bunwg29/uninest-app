import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Input, Modal, Typography } from '@ui';
import { useToast } from '@hooks';
import {
  locationsService,
  type LocationProvince,
  type LocationWard,
} from '../services/locationsService';

export interface AddressValue {
  province: LocationProvince | null;
  ward: LocationWard | null;
  streetAddress: string;
}

export const EMPTY_ADDRESS: AddressValue = { province: null, ward: null, streetAddress: '' };

interface AddressFieldsProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  isRequired?: boolean;
  streetHelperText?: string;
  showPreview?: boolean;
}

const matchesKeyword = (item: { name: string; fullName: string }, keyword: string) =>
  item.name.toLowerCase().includes(keyword) || item.fullName.toLowerCase().includes(keyword);

export const AddressFields = ({
  value,
  onChange,
  isRequired = true,
  streetHelperText = 'Tùy chọn số nhà, tên đường cụ thể',
  showPreview = true,
}: AddressFieldsProps) => {
  const toast = useToast();
  const { province, ward, streetAddress } = value;
  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);
  const [isWardModalVisible, setIsWardModalVisible] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const provinceCode = province?.code;

  useEffect(() => {
    let isMounted = true;

    const fetchProvinces = async () => {
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

    void fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!provinceCode) {
      setWards([]);

      return undefined;
    }

    let isMounted = true;

    const fetchWards = async () => {
      try {
        setIsLoadingWards(true);

        const data = await locationsService.getWardsByProvince(provinceCode);

        if (isMounted) setWards(data);
      } catch {
        if (isMounted) toast.error('Không thể tải danh sách phường/xã');
      } finally {
        if (isMounted) setIsLoadingWards(false);
      }
    };

    void fetchWards();

    return () => {
      isMounted = false;
    };
  }, [provinceCode, toast]);

  const filteredProvinces = useMemo(() => {
    const keyword = provinceSearch.toLowerCase().trim();

    return keyword ? provinces.filter((item) => matchesKeyword(item, keyword)) : provinces;
  }, [provinces, provinceSearch]);

  const filteredWards = useMemo(() => {
    const keyword = wardSearch.toLowerCase().trim();

    return keyword ? wards.filter((item) => matchesKeyword(item, keyword)) : wards;
  }, [wards, wardSearch]);

  const fullAddressPreview = [streetAddress.trim(), ward?.fullName, province?.fullName]
    .filter(Boolean)
    .join(', ');

  const handleSelectProvince = (selected: LocationProvince) => {
    setIsProvinceModalVisible(false);
    setProvinceSearch('');

    if (selected.code !== province?.code) {
      onChange({ ...value, province: selected, ward: null });
    }
  };

  const handleSelectWard = (selected: LocationWard) => {
    setIsWardModalVisible(false);
    setWardSearch('');
    onChange({ ...value, ward: selected });
  };

  const handleOpenWardModal = () => {
    if (!province) {
      toast.info('Vui lòng chọn Tỉnh/Thành phố trước');

      return;
    }

    setIsWardModalVisible(true);
  };

  const requiredMark = isRequired ? (
    <Typography variant="caption" color={THEME_COLORS.ERROR}>
      *
    </Typography>
  ) : null;

  const renderOption = (
    item: { code: string; fullName: string },
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.listItem, isSelected && styles.listItemSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Typography
        variant="body1"
        weight={isSelected ? 'SEMIBOLD' : 'REGULAR'}
        color={isSelected ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PRIMARY}
      >
        {item.fullName}
      </Typography>

      {isSelected ? <Check size={18} color={THEME_COLORS.PRIMARY} /> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.fieldWrapper}>
        <Typography variant="caption" weight="MEDIUM" style={styles.label}>
          Tỉnh / Thành phố {requiredMark}
        </Typography>

        <TouchableOpacity
          style={styles.selectorTrigger}
          onPress={() => setIsProvinceModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.triggerLeft}>
            <MapPin
              size={18}
              color={province ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
            />

            <Typography
              variant="body1"
              color={province ? THEME_COLORS.TEXT_PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER}
              style={styles.triggerText}
            >
              {province ? province.fullName : 'Chọn Tỉnh / Thành phố'}
            </Typography>
          </View>

          <ChevronDown size={18} color={THEME_COLORS.TEXT_MUTED} />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldWrapper}>
        <Typography variant="caption" weight="MEDIUM" style={styles.label}>
          Phường / Xã {requiredMark}
        </Typography>

        <TouchableOpacity
          style={[styles.selectorTrigger, !province && styles.selectorDisabled]}
          onPress={handleOpenWardModal}
          activeOpacity={province ? 0.7 : 1}
        >
          <View style={styles.triggerLeft}>
            <MapPin size={18} color={ward ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_PLACEHOLDER} />

            <Typography
              variant="body1"
              color={
                !province
                  ? THEME_COLORS.TEXT_MUTED
                  : ward
                    ? THEME_COLORS.TEXT_PRIMARY
                    : THEME_COLORS.TEXT_PLACEHOLDER
              }
              style={styles.triggerText}
            >
              {!province
                ? 'Vui lòng chọn Tỉnh/Thành trước'
                : ward
                  ? ward.fullName
                  : 'Chọn Phường / Xã'}
            </Typography>
          </View>

          {isLoadingWards ? (
            <ActivityIndicator size="small" color={THEME_COLORS.PRIMARY} />
          ) : (
            <ChevronDown size={18} color={THEME_COLORS.TEXT_MUTED} />
          )}
        </TouchableOpacity>
      </View>

      <Input
        label="Số nhà, tên đường"
        placeholder="Ví dụ: Số 123 Đường Nguyễn Huệ"
        value={streetAddress}
        onChangeText={(text) => onChange({ ...value, streetAddress: text })}
        autoCapitalize="words"
        helperText={streetHelperText}
        maxLength={255}
      />

      {showPreview && fullAddressPreview ? (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <MapPin size={16} color={THEME_COLORS.PRIMARY} />

            <Typography
              variant="caption"
              weight="SEMIBOLD"
              color={THEME_COLORS.PRIMARY}
              style={styles.previewTitle}
            >
              Địa chỉ đầy đủ
            </Typography>
          </View>

          <Typography variant="body2" color={THEME_COLORS.TEXT_PRIMARY} style={styles.previewText}>
            {fullAddressPreview}
          </Typography>
        </View>
      ) : null}

      <Modal
        isVisible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        title="Chọn Tỉnh / Thành phố"
        style={styles.modalContent}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm tỉnh/thành phố..."
            value={provinceSearch}
            onChangeText={setProvinceSearch}
            leftIcon={<Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
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
              renderItem={({ item }) =>
                renderOption(item, province?.code === item.code, () => handleSelectProvince(item))
              }
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
                    Không tìm thấy tỉnh/thành phố phù hợp
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
        title={`Chọn Phường/Xã (${province?.name || ''})`}
        style={styles.modalContent}
      >
        <View style={styles.modalBody}>
          <Input
            placeholder="Tìm kiếm phường/xã..."
            value={wardSearch}
            onChangeText={setWardSearch}
            leftIcon={<Search size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
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
              renderItem={({ item }) =>
                renderOption(item, ward?.code === item.code, () => handleSelectWard(item))
              }
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Typography variant="body2" color={THEME_COLORS.TEXT_MUTED}>
                    Không tìm thấy phường/xã phù hợp
                  </Typography>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  fieldWrapper: { marginBottom: SPACING_TOKENS.MD },
  label: { marginBottom: 6, color: THEME_COLORS.TEXT_PRIMARY },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selectorDisabled: { backgroundColor: THEME_COLORS.BACKGROUND, opacity: 0.7 },
  triggerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  triggerText: { marginLeft: SPACING_TOKENS.SM, flex: 1 },
  previewCard: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    marginTop: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.PRIMARY + '33',
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  previewTitle: { marginLeft: 6 },
  previewText: { lineHeight: 20 },
  modalContent: { maxHeight: '80%' },
  modalBody: { maxHeight: 400 },
  searchInput: { marginBottom: SPACING_TOKENS.SM },
  modalLoading: {
    paddingVertical: SPACING_TOKENS.XL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { maxHeight: 320 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING_TOKENS.SM + 2,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  listItemSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  emptyList: { paddingVertical: SPACING_TOKENS.LG, alignItems: 'center' },
});
