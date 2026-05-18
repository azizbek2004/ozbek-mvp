import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { Colors } from "../design-system/Colors";
import { Typography } from "../design-system/Typography";
import { Spacing } from "../design-system/Spacing";
import { useOfflineStore } from "../../stores/offlineStore";
import { useTranslation } from "react-i18next";

export function NetworkBanner() {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt } = useOfflineStore();
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const shouldShow = !isOnline || isSyncing || pendingCount > 0;
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -50,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOnline, isSyncing, pendingCount, slideAnim]);

  if (isSyncing) {
    return (
      <Animated.View
        style={[
          styles.banner,
          styles.syncBanner,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.syncText}>{t("syncing")}</Text>
      </Animated.View>
    );
  }

  if (!isOnline) {
    return (
      <Animated.View
        style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.text}>
          📡 {t("noInternet")}. {t("dataSyncLater")}
          {pendingCount > 0 ? ` (${pendingCount} ${t("pendingOps")})` : ""}
        </Text>
      </Animated.View>
    );
  }

  if (pendingCount > 0) {
    return (
      <Animated.View
        style={[
          styles.banner,
          styles.pendingBanner,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.pendingText}>
          ⏳ {pendingCount} {t("pendingOps")}
        </Text>
      </Animated.View>
    );
  }

  if (lastSyncedAt && isOnline) {
    const timeSince = Math.floor(
      (Date.now() - new Date(lastSyncedAt).getTime()) / 1000,
    );
    if (timeSince < 5) {
      return (
        <Animated.View
          style={[
            styles.banner,
            styles.syncedBanner,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.syncedText}>✅ {t("synced")}</Text>
        </Animated.View>
      );
    }
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.warningLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  syncBanner: {
    backgroundColor: Colors.primaryLight,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  pendingBanner: { backgroundColor: Colors.surfaceElevated },
  syncedBanner: { backgroundColor: Colors.successLight },
  text: { ...Typography.caption, color: Colors.warning },
  syncText: { ...Typography.caption, color: Colors.primary },
  pendingText: { ...Typography.caption, color: Colors.textSecondary },
  syncedText: { ...Typography.caption, color: Colors.success },
});
