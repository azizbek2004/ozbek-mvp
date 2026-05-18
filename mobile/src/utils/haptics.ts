/**
 * Haptic feedback utility
 * Provides haptic/tactile feedback for user interactions.
 * Uses expo-haptics when available, gracefully degrades.
 */

import * as Haptics from "expo-haptics";

export function impactLight() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // silently ignore
  }
}

export function impactMedium() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // silently ignore
  }
}

export function impactHeavy() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // silently ignore
  }
}

export function notificationSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // silently ignore
  }
}

export function notificationError() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // silently ignore
  }
}

export function selectionChanged() {
  try {
    Haptics.selectionAsync();
  } catch {
    // silently ignore
  }
}
