import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  comprobarSalud,
  obtenerCategorias,
  obtenerCursos,
} from '../services/api';

export default function CatalogScreen({ navigation }) {
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorCategorias, setErrorCategorias] = useState('');
  const [estadoApi, setEstadoApi] = useState('checking');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activa = true;

    obtenerCategorias()
      .then((datos) => {
        if (activa) {
          setCategorias(datos);
          setErrorCategorias('');
        }
      })
      .catch((e) => {
        if (activa) {
          setErrorCategorias(e.message || 'No fue posible cargar categorías.');
        }
      });

    return () => {
      activa = false;
    };
  }, []);

  const revisarEstadoApi = useCallback(async () => {
    setEstadoApi('checking');
    try {
      await comprobarSalud();
      setEstadoApi('ok');
    } catch {
      setEstadoApi('error');
    }
  }, []);

  useEffect(() => {
    revisarEstadoApi();
  }, [revisarEstadoApi]);

  useEffect(() => {
    let activa = true;

    async function cargarCursos() {
      try {
        setCargando(true);
        setError('');
        const datos = await obtenerCursos(categoriaSeleccionada);
        if (activa) {
          setCursos(datos);
        }
      } catch (e) {
        if (activa) {
          setError(e.message || 'No fue posible conectar con el servidor.');
        }
      } finally {
        if (activa) {
          setCargando(false);
        }
      }
    }

    cargarCursos();
    return () => {
      activa = false;
    };
  }, [categoriaSeleccionada, intento]);

  const renderEncabezado = () => (
    <View>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.marca}>CATÁLOGO ACADÉMICO</Text>
          <View
            style={[
              styles.estadoPunto,
              estadoApi === 'ok' && styles.estadoPuntoOk,
              estadoApi === 'error' && styles.estadoPuntoError,
            ]}
          />
        </View>
        <Text style={styles.titulo}>Aprendé algo nuevo.</Text>
        <Text style={styles.descripcionHero}>
          Explorá cursos y encontrá el próximo paso para tu formación.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={revisarEstadoApi}
          style={styles.estadoBoton}
        >
          <Text style={styles.estadoTexto}>
            {estadoApi === 'checking'
              ? 'Verificando servidor...'
              : estadoApi === 'ok'
                ? 'Servidor disponible · Revisar'
                : 'Servidor no disponible · Reintentar'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.seccion}>
        <View style={styles.seccionEncabezado}>
          <View>
            <Text style={styles.sobreTitulo}>PARA VOS</Text>
            <Text style={styles.tituloSeccion}>Cursos disponibles</Text>
          </View>
          <Text style={styles.contador}>
            {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: categoriaSeleccionada == null }}
            onPress={() => setCategoriaSeleccionada(null)}
            style={[
              styles.filtro,
              categoriaSeleccionada == null && styles.filtroActivo,
            ]}
          >
            <Text
              style={[
                styles.filtroTexto,
                categoriaSeleccionada == null && styles.filtroTextoActivo,
              ]}
            >
              Todos
            </Text>
          </Pressable>
          {categorias.map((categoria) => {
            const activo = categoriaSeleccionada === categoria.id;
            return (
              <Pressable
                key={String(categoria.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                onPress={() => setCategoriaSeleccionada(categoria.id)}
                style={[styles.filtro, activo && styles.filtroActivo]}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    activo && styles.filtroTextoActivo,
                  ]}
                >
                  {categoria.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {errorCategorias ? (
          <Text style={styles.avisoCategorias}>
            No se pudieron cargar las categorías: {errorCategorias}
          </Text>
        ) : null}
        {error && cursos.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIntento((actual) => actual + 1)}
            style={styles.avisoError}
          >
            <Text style={styles.avisoErrorTexto}>
              {error}  ·  Tocar para reintentar
            </Text>
          </Pressable>
        ) : null}
        {cargando && cursos.length > 0 ? (
          <View style={styles.cargandoFiltro}>
            <ActivityIndicator size="small" color="#5965D8" />
            <Text style={styles.textoCargandoFiltro}>Actualizando cursos...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (cargando && cursos.length === 0) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#5965D8" />
          <Text style={styles.textoEstado}>Cargando cursos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && cursos.length === 0) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        {renderEncabezado()}
        <View style={styles.centro}>
          <Text style={styles.iconoEstado}>!</Text>
          <Text style={styles.tituloEstado}>No pudimos cargar los cursos</Text>
          <Text style={styles.textoError}>{error}</Text>
          <Pressable
            onPress={() => setIntento((actual) => actual + 1)}
            style={styles.botonReintentar}
          >
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <FlatList
        data={cursos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={renderEncabezado}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.iconoVacio}>⌕</Text>
            <Text style={styles.tituloEstado}>Todavía no hay cursos</Text>
            <Text style={styles.textoEstado}>
              No hay cursos disponibles en esta categoría.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('DetalleCurso', { id: item.id })
            }
            style={({ pressed }) => [
              styles.tarjeta,
              pressed && styles.tarjetaPresionada,
            ]}
          >
            <View
              style={[
                styles.tarjetaIcono,
                index % 2 === 0 ? styles.iconoLavanda : styles.iconoDurazno,
              ]}
            >
              <Text style={styles.tarjetaIconoTexto}>
                {item.nombre?.trim()?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
            <View style={styles.tarjetaContenido}>
              <Text style={styles.categoriaTexto}>
                {item.categoria?.nombre ?? 'Sin categoría'}
              </Text>
              <Text style={styles.nombreCurso}>{item.nombre}</Text>
              <View style={styles.detallesCurso}>
                <Text style={styles.detalleTexto}>
                  {item.duracion_horas} horas
                </Text>
                {item.nivel ? (
                  <>
                    <Text style={styles.separadorDetalle}>·</Text>
                    <Text style={styles.detalleTexto}>{item.nivel}</Text>
                  </>
                ) : null}
              </View>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F6F7FB' },
  lista: { paddingBottom: 28 },
  hero: {
    margin: 18,
    marginBottom: 26,
    padding: 23,
    borderRadius: 24,
    backgroundColor: '#20294A',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marca: {
    color: '#B9C1FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  estadoPunto: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F5BE66',
  },
  estadoPuntoOk: { backgroundColor: '#69D5A5' },
  estadoPuntoError: { backgroundColor: '#FF8D8D' },
  titulo: {
    marginTop: 25,
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  descripcionHero: {
    marginTop: 9,
    color: '#D5D9EA',
    fontSize: 15,
    lineHeight: 22,
  },
  estadoBoton: { alignSelf: 'flex-start', marginTop: 17 },
  estadoTexto: { color: '#B9C1FF', fontSize: 12, fontWeight: '600' },
  seccion: { paddingHorizontal: 20 },
  seccionEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sobreTitulo: {
    color: '#7B82A2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  tituloSeccion: {
    marginTop: 5,
    color: '#20294A',
    fontSize: 23,
    fontWeight: '800',
  },
  contador: { color: '#7B82A2', fontSize: 12, marginBottom: 3 },
  filtros: { gap: 8, paddingVertical: 17 },
  filtro: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EAF2',
  },
  filtroActivo: { backgroundColor: '#5965D8', borderColor: '#5965D8' },
  filtroTexto: { color: '#5D6481', fontSize: 13, fontWeight: '600' },
  filtroTextoActivo: { color: '#FFFFFF' },
  avisoCategorias: {
    color: '#A16C21',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  avisoError: {
    marginBottom: 12,
  },
  avisoErrorTexto: { color: '#A23945', fontSize: 13, lineHeight: 19 },
  cargandoFiltro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  textoCargandoFiltro: { color: '#737A98', fontSize: 12 },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF5',
  },
  tarjetaPresionada: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  tarjetaIcono: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoLavanda: { backgroundColor: '#ECEBFF' },
  iconoDurazno: { backgroundColor: '#FFF0E8' },
  tarjetaIconoTexto: {
    color: '#555FBD',
    fontWeight: '800',
    fontSize: 19,
  },
  tarjetaContenido: { flex: 1, marginLeft: 13, marginRight: 8 },
  categoriaTexto: {
    color: '#727A9B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  nombreCurso: {
    color: '#20294A',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  detallesCurso: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  detalleTexto: { color: '#878DA6', fontSize: 12 },
  separadorDetalle: { color: '#B4B8C8', marginHorizontal: 6 },
  flecha: { color: '#A3A8BC', fontSize: 28, lineHeight: 30 },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  textoEstado: { color: '#727A96', fontSize: 14, marginTop: 12 },
  tituloEstado: {
    color: '#20294A',
    fontWeight: '800',
    fontSize: 19,
    textAlign: 'center',
    marginTop: 10,
  },
  textoError: {
    color: '#727A96',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  iconoEstado: {
    width: 42,
    height: 42,
    lineHeight: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: '#FFE9E9',
    color: '#B84552',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  botonReintentar: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#5965D8',
  },
  botonReintentarTexto: { color: '#FFFFFF', fontWeight: '700' },
  vacio: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 48 },
  iconoVacio: { color: '#989FC4', fontSize: 42 },
});
