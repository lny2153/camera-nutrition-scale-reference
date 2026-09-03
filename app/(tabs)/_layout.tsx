import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';
import { FloatingSimulator } from '@/components/floating-simulator';

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#FFFFFF' } }}>
        <Tabs.Screen name="index" options={{ title: '测量' }} />
        <Tabs.Screen name="trends" options={{ title: '趋势' }} />
        <Tabs.Screen name="more" options={{ title: '更多' }} />
      </Tabs>
      <FloatingSimulator />
    </>
  );
}
