import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerCurso } from '../services/api';

export default function CourseDetailScreen({ route }) {
  const { id } = route.params;
  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activa = true;

    async function cargarDetalle() {
      try {
        setCargando(true);
        setError('');
        const datos = await obtenerCurso(id);
        if (activa) {
          setCurso(datos);
        }
      } catch (e) {
        if (activa) {
          setError(e.message || 'No fue posible cargar el detalle del curso.');
        }
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    }

    cargarDetalle();
    return () => {
      activa = false;
    };
  }, [id, intento]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['bottom']}>
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#5965D8" />
          <Text style={styles.textoSecundario}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['bottom']}>
        <View style={styles.centro}>
          <Text style={styles.tituloError}>No pudimos cargar este curso</Text>
          <Text style={styles.textoSecundario}>{error}</Text>
          <Pressable
            onPress={() => setIntento((actual) => actual + 1)}
            style={styles.boton}
          >
            <Text style={styles.botonTexto}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!curso || typeof curso !== 'object') {
    return (
      <SafeAreaView style={styles.pantalla} edges={['bottom']}>
        <View style={styles.centro}>
          <Text style={styles.tituloError}>Curso no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.ilustracion}>
          <Text style={styles.ilustracionTexto}>
            {curso.nombre?.trim()?.charAt(0)?.toUpperCase() || 'C'}
          </Text>
        </View>
        <Text style={styles.categoria}>
          {curso.categoria?.nombre ?? 'Sin categoría'}
        </Text>
        <Text style={styles.nombre}>{curso.nombre}</Text>

        <View style={styles.etiquetas}>
          <View style={styles.etiqueta}>
            <Text style={styles.etiquetaTexto}>
              {curso.duracion_horas} horas
            </Text>
          </View>
          {curso.nivel ? (
            <View style={styles.etiqueta}>
              <Text style={styles.etiquetaTexto}>{curso.nivel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.tarjetaDescripcion}>
          <Text style={styles.tituloDescripcion}>Sobre este curso</Text>
          <Text style={styles.descripcion}>
            {curso.descripcion || 'No hay una descripción disponible.'}
          </Text>
        </View>
        <Text style={styles.idCurso}>Curso #{curso.id}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F6F7FB' },
  contenido: { padding: 22, paddingBottom: 40 },
  ilustracion: {
    height: 190,
    borderRadius: 24,
    backgroundColor: '#20294A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  ilustracionTexto: {
    color: '#C6C9FF',
    fontSize: 76,
    fontWeight: '800',
  },
  categoria: {
    color: '#5965D8',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  nombre: {
    color: '#20294A',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
  },
  etiquetas: { flexDirection: 'row', gap: 9, marginTop: 16 },
  etiqueta: {
    backgroundColor: '#ECEBFF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
  },
  etiquetaTexto: { color: '#515DB9', fontSize: 12, fontWeight: '700' },
  tarjetaDescripcion: {
    marginTop: 27,
    padding: 19,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF5',
  },
  tituloDescripcion: {
    color: '#20294A',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 9,
  },
  descripcion: { color: '#666E8A', fontSize: 15, lineHeight: 24 },
  idCurso: { color: '#9BA0B4', fontSize: 12, marginTop: 17 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  textoSecundario: {
    color: '#727A96',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
  },
  tituloError: {
    color: '#20294A',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  boton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#5965D8',
  },
  botonTexto: { color: '#FFFFFF', fontWeight: '700' },
});
