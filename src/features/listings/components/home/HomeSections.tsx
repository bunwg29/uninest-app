import type { ComponentType } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MapPin, MessageSquareText, Sparkle, Sparkles } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { GradientView, Typography } from '@ui';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showSparkle?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const SectionHeader = ({
  title,
  subtitle,
  showSparkle = false,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleGroup}>
        <Typography
          variant="h2"
          weight="SEMIBOLD"
          colorKey="TEXT_PRIMARY"
          numberOfLines={1}
          style={styles.sectionTitle}
        >
          {title}
        </Typography>

        {showSparkle ? (
          <Sparkle
            size={18}
            color={THEME_COLORS.SECONDARY}
            fill={THEME_COLORS.SECONDARY}
            style={styles.sparkle}
          />
        ) : null}
      </View>

      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7} accessibilityRole="button">
          <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
            {actionLabel}
          </Typography>
        </TouchableOpacity>
      ) : null}
    </View>

    {subtitle ? (
      <Typography
        variant="caption"
        weight="MEDIUM"
        colorKey="TEXT_PLACEHOLDER"
        style={styles.sectionSubtitle}
      >
        {subtitle}
      </Typography>
    ) : null}
  </View>
);

export interface HomeChipItem {
  id: string;
  label: string;
}

interface HomeChipRowProps {
  chips: readonly HomeChipItem[];
  selectedId: string;
  onChipPress: (chipId: string) => void;
}

export const HomeChipRow = ({ chips, selectedId, onChipPress }: HomeChipRowProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.chipRow}
  >
    {chips.map((chip) => {
      const isSelected = chip.id === selectedId;

      return (
        <TouchableOpacity
          key={chip.id}
          style={[styles.chip, isSelected ? styles.chipSelected : styles.chipDefault]}
          onPress={() => onChipPress(chip.id)}
          activeOpacity={0.8}
          accessibilityState={{ selected: isSelected }}
        >
          {isSelected ? <MapPin size={14} color={THEME_COLORS.PRIMARY_DARK} /> : null}

          <Typography
            variant="label"
            weight={isSelected ? 'SEMIBOLD' : 'MEDIUM'}
            color={isSelected ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_SECONDARY}
            style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
          >
            {chip.label}
          </Typography>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

interface AiBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  Icon?: ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
}

export const AiBanner = ({
  title,
  description,
  actionLabel,
  Icon = MessageSquareText,
  onPress,
}: AiBannerProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityLabel={title}>
    <GradientView
      colors={[THEME_COLORS.PRIMARY, OVERLAY_COLORS.AI_BANNER_END]}
      style={styles.banner}
    >
      <View style={styles.bannerIcon}>
        <Icon size={22} color={THEME_COLORS.WHITE} />
      </View>

      <View style={styles.bannerText}>
        <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.WHITE}>
          {title}
        </Typography>

        <Typography
          variant="caption"
          color={OVERLAY_COLORS.AI_BANNER_TEXT}
          style={styles.bannerDescription}
        >
          {description}
        </Typography>
      </View>

      <View style={styles.bannerAction}>
        <Typography variant="body2" weight="SEMIBOLD" color={THEME_COLORS.PRIMARY_DARK}>
          {actionLabel}
        </Typography>
      </View>
    </GradientView>
  </TouchableOpacity>
);

export const InfoBanner = ({ message }: { message: string }) => (
  <View style={styles.infoBanner}>
    <Sparkles size={18} color={THEME_COLORS.PRIMARY_DARK} />

    <Typography
      variant="label"
      weight="REGULAR"
      color={THEME_COLORS.PRIMARY_DARK}
      style={styles.infoText}
    >
      {message}
    </Typography>
  </View>
);

interface AreaChipsProps {
  areas: readonly string[];
  onAreaPress: (area: string) => void;
}

export const AreaChips = ({ areas, onAreaPress }: AreaChipsProps) => (
  <View style={styles.areaRow}>
    {areas.map((area) => (
      <TouchableOpacity
        key={area}
        style={styles.areaChip}
        onPress={() => onAreaPress(area)}
        activeOpacity={0.8}
      >
        <Typography variant="body2" weight="MEDIUM" color={THEME_COLORS.TEXT_SECONDARY}>
          {area}
        </Typography>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  sectionTitleRow: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING_TOKENS.SM,
  },
  sectionTitle: {
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  sparkle: {
    marginLeft: SPACING_TOKENS.SM,
  },
  sectionSubtitle: {
    marginTop: SPACING_TOKENS.XXS,
    letterSpacing: 0.2,
  },
  chipRow: {
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  chip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD - SPACING_TOKENS.XXS,
    marginRight: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
  },
  chipSelected: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderColor: THEME_COLORS.PRIMARY,
  },
  chipLabel: {
    lineHeight: 20,
  },
  chipLabelSelected: {
    marginLeft: 6,
  },
  banner: {
    height: 88,
    marginHorizontal: SPACING_TOKENS.MD,
    paddingHorizontal: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: OVERLAY_COLORS.AI_BANNER_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    marginLeft: SPACING_TOKENS.MD - SPACING_TOKENS.XXS * 2,
    marginRight: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  bannerDescription: {
    marginTop: SPACING_TOKENS.XXS,
    lineHeight: 17,
  },
  bannerAction: {
    height: 36,
    paddingHorizontal: SPACING_TOKENS.MD - SPACING_TOKENS.XXS,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.MD - SPACING_TOKENS.XXS - 1,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING_TOKENS.SM + 2,
  },
  areaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING_TOKENS.MD,
  },
  areaChip: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD - SPACING_TOKENS.XXS,
    marginRight: SPACING_TOKENS.SM,
    marginBottom: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
