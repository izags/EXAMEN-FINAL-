import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CatalogScreen from './src/screens/CatalogScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#F6F7FB' },
            headerTintColor: '#18213A',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#F6F7FB' },
          }}
        >
          <Stack.Screen
            name="Catalogo"
            component={CatalogScreen}
            options={{ title: 'Aula abierta', headerShown: false }}
          />
          <Stack.Screen
            name="DetalleCurso"
            component={CourseDetailScreen}
            options={{ title: 'Detalle del curso' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
