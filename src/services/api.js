import { API_URL } from '../config/api';

async function consultar(endpoint) {
  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await respuesta.json();

  if (!respuesta.ok || !json.success) {
    throw new Error(json.message || 'No fue posible consultar la API.');
  }

  return json.data;
}

export async function obtenerCursos(idCategoria) {
  const filtro =
    idCategoria == null
      ? ''
      : `?categoria_id=${encodeURIComponent(idCategoria)}`;
  const datos = await consultar(`/cursos${filtro}`);

  if (!Array.isArray(datos)) {
    throw new Error('La respuesta de cursos no tiene un formato válido.');
  }

  return datos;
}

export async function obtenerCategorias() {
  const datos = await consultar('/categorias');

  if (!Array.isArray(datos)) {
    throw new Error('La respuesta de categorías no tiene un formato válido.');
  }

  return datos;
}

export function obtenerCurso(id) {
  return consultar(`/cursos/${encodeURIComponent(id)}`);
}

export async function comprobarSalud() {
  const datos = await consultar('/health');

  if (datos?.status !== 'ok') {
    throw new Error('La API respondió, pero no confirmó su estado disponible.');
  }

  return datos;
}
