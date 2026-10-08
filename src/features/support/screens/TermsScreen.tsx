import { useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Info, Share as ShareIcon } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { HeaderBar, NoticeBanner, ScreenContainer, Typography } from '@ui';
import { LEGAL_DOCUMENTS, LEGAL_TABS, LEGAL_UPDATED_AT } from '../constants';
import type { LegalTab } from '../types';

type TermsRouteProp = RouteProp<{ Terms: { tab?: LegalTab } | undefined }, 'Terms'>;

export const TermsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<TermsRouteProp>();
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<LegalTab>(route.params?.tab ?? 'privacy');

  const legalDocument = LEGAL_DOCUMENTS[activeTab];

  const handleSelectTab = (tab: LegalTab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleShare = () => {
    void Share.share({
      title: `${legalDocument.label} UniNest`,
      message: `${legalDocument.label} UniNest: ${legalDocument.shareUrl}`,
    }).catch(() => undefined);
  };

  return (
    <ScreenContainer keyboardAvoiding={false} style={styles.container}>
      <HeaderBar
        title="Điều khoản & Quyền riêng tư"
        alignTitle="left"
        onBack={() => navigation.goBack()}
        style={styles.header}
        rightAction={
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chia sẻ"
          >
            <ShareIcon size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        }
      />

      <View style={styles.tabs} accessibilityRole="tablist">
        {LEGAL_TABS.map((tab) => {
          const isActive = tab === activeTab;

          return (
            <Pressable
              key={tab}
              style={styles.tab}
              onPress={() => handleSelectTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Typography
                variant="label"
                weight={isActive ? 'BOLD' : 'MEDIUM'}
                colorKey={isActive ? 'PRIMARY_DARK' : 'TEXT_PLACEHOLDER'}
              >
                {LEGAL_DOCUMENTS[tab].label}
              </Typography>
              {isActive ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          style={styles.updatedAt}
        >
          {`Cập nhật lần cuối: ${LEGAL_UPDATED_AT} · Áp dụng cho toàn bộ người dùng UniNest tại Việt Nam`}
        </Typography>

        <NoticeBanner tone="info" icon={Info}>
          {legalDocument.summary}
        </NoticeBanner>

        {legalDocument.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Typography variant="body1" weight="BOLD">
              {section.title}
            </Typography>
            <Typography
              variant="label"
              weight="REGULAR"
              colorKey="TEXT_MUTED"
              style={styles.sectionBody}
            >
              {section.body}
            </Typography>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
  },
  header: {
    borderBottomColor: THEME_COLORS.BORDER,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING_TOKENS.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING_TOKENS.SM,
    paddingBottom: 10,
  },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  updatedAt: {
    letterSpacing: 0.2,
    marginBottom: SPACING_TOKENS.MD,
  },
  section: {
    marginTop: 18,
  },
  sectionBody: {
    marginTop: 6,
    lineHeight: 21,
  },
});
