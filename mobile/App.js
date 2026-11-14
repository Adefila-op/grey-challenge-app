import { useEffect, useRef } from "react";
import { BackHandler, Platform, StatusBar, View } from "react-native";
import { WebView } from "react-native-webview";

// Put your Vercel address here before you build.
const APP_URL = "https://YOUR-PROJECT.vercel.app";

export default function App() {
  const web = useRef(null);
  const canGoBack = useRef(false);

  // The Android back button goes back inside the app before it closes it.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack.current && web.current) {
        web.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#6b4ef5",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6b4ef5" />
      <WebView
        ref={web}
        source={{ uri: APP_URL }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onNavigationStateChange={(state) => {
          canGoBack.current = state.canGoBack;
        }}
      />
    </View>
  );
}
