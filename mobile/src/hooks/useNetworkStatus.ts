import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineStore } from "../stores/offlineStore";

export function useNetworkStatus() {
  const setOnline = useOfflineStore((s) => s.setOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      setOnline(online);
    });

    NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      setOnline(online);
    });

    return unsubscribe;
  }, [setOnline]);
}
