import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "../components/design-system/Spacing";

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? Spacing.xl : Spacing.base;
  const contentMaxWidth = isTablet ? 560 : width;
  const gridGap = Spacing.md;
  const gridItemWidth = Math.floor(
    (width - horizontalPadding * 2 - gridGap) / 2,
  );
  const tabBarHeight = 64 + insets.bottom;

  return {
    width,
    height,
    insets,
    isSmallPhone,
    isTablet,
    horizontalPadding,
    contentMaxWidth,
    gridGap,
    gridItemWidth,
    tabBarHeight,
  };
}
