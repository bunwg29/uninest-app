import { useWindowDimensions } from 'react-native';

export const RESPONSIVE_MAX_CONTENT_WIDTH = 768;
export const COMPACT_SCREEN_WIDTH = 375;

export const useResponsiveLayout = (maxContentWidth = RESPONSIVE_MAX_CONTENT_WIDTH) => {
  const { width, height, fontScale } = useWindowDimensions();
  const viewportWidth = Math.max(width, 1);

  return {
    viewportWidth,
    viewportHeight: height,
    contentWidth: Math.min(viewportWidth, maxContentWidth),
    isCompact: viewportWidth < COMPACT_SCREEN_WIDTH,
    isTablet: viewportWidth >= 768,
    fontScale,
  };
};
