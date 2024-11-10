// screens/Inicio.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../DataBase/Configuraciones';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'; // Asegúrate de importar addDoc
import NuevaReparacionForm from '../components/NuevaReparacion';
import ReparacionItem from '../components/ReparacionItem';
import TarjetaEstadistica from '../components/TarjetaEstadistica';
import Alerta from '../components/Alerta';

const Inicio = ({ navigation }) => {
  const [reparaciones, setReparaciones] = useState([]);
  const [mostrarFormularioReparacion, setMostrarFormularioReparacion] = useState(false);
  const [reparacionParaEditar, setReparacionParaEditar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // Función para mostrar mensajes de alerta
  const mostrarMensajeAlerta = (mensaje) => {
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  // Función para actualizar el estado de una reparación
  const actualizarEstadoReparacion = async (reparacion) => {
    try {
      const reparacionRef = doc(db, 'reparaciones', reparacion.id);
      let nuevoEstado;
      const currentEstado = reparacion.gestionOrden.estado;
      if (currentEstado === 'Pendiente') {
        nuevoEstado = 'En progreso';
      } else if (currentEstado === 'En progreso') {
        nuevoEstado = 'Completado';
      } else {
        nuevoEstado = 'Pendiente';
      }

      await updateDoc(reparacionRef, {
        'gestionOrden.estado': nuevoEstado,
      });

      mostrarMensajeAlerta('Estado de la reparación actualizado.');
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar el estado.');
    }
  };

  // Función para eliminar una reparación
  const eliminarReparacion = async (id) => {
    try {
      const reparacionRef = doc(db, 'reparaciones', id);
      await deleteDoc(reparacionRef);
      mostrarMensajeAlerta('Reparación eliminada exitosamente.');
    } catch (error) {
      console.error('Error al eliminar la reparación:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar la reparación.');
    }
  };

  // Función para manejar la edición de una reparación
  const editarReparacion = (reparacion) => {
    setReparacionParaEditar(reparacion);
    setMostrarFormularioReparacion(true);
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = (reparacionesData) => {
    const totalReparaciones = reparacionesData.length;
    const reparacionesPendientes = reparacionesData.filter(
      (r) => r.gestionOrden.estado === 'Pendiente'
    ).length;
    const reparacionesCompletadasHoy = reparacionesData.filter(
      (r) =>
        r.gestionOrden.estado === 'Completado' &&
        r.programacion.fechaEntrega === new Date().toISOString().split('T')[0]
    ).length;

    // Calcular el tiempo promedio de reparaciones completadas
    const reparacionesCompletadas = reparacionesData.filter(
      (r) => r.gestionOrden.estado === 'Completado'
    );

    let tiempoTotal = 0; // En minutos
    reparacionesCompletadas.forEach((reparacion) => {
      const { fechaRecepcion, horaRecepcion } = reparacion.programacion;
      const { fechaEntrega, horaEntrega } = reparacion.programacion;

      // Asegúrate de que las fechas y horas estén en el formato correcto
      const fechaHoraRecepcion = new Date(`${fechaRecepcion}T${horaRecepcion}`);
      const fechaHoraEntrega = new Date(`${fechaEntrega}T${horaEntrega}`);

      const diferenciaMs = fechaHoraEntrega - fechaHoraRecepcion;
      const diferenciaMinutos = diferenciaMs / (1000 * 60);
      tiempoTotal += diferenciaMinutos;
    });

    const tiempoPromedioMinutos =
      reparacionesCompletadas.length > 0 ? tiempoTotal / reparacionesCompletadas.length : 0;

    const horas = Math.floor(tiempoPromedioMinutos / 60);
    const minutos = Math.round(tiempoPromedioMinutos % 60);
    const tiempoPromedio = `${horas}h ${minutos}m`;

    return {
      totalReparaciones,
      reparacionesPendientes,
      reparacionesCompletadasHoy,
      tiempoPromedio,
    };
  };

  const [estadisticas, setEstadisticas] = useState({
    totalReparaciones: 0,
    reparacionesPendientes: 0,
    reparacionesCompletadasHoy: 0,
    tiempoPromedio: '0h 0m',
  });

  useEffect(() => {
    const reparacionesRef = collection(db, 'reparaciones');
    const unsubscribe = onSnapshot(
      reparacionesRef,
      (querySnapshot) => {
        const reparacionesData = [];
        querySnapshot.forEach((doc) => {
          reparacionesData.push({ id: doc.id, ...doc.data() });
        });
        setReparaciones(reparacionesData);
        setEstadisticas(calcularEstadisticas(reparacionesData));
        setCargando(false);
      },
      (error) => {
        console.error('Error al obtener reparaciones:', error);
        Alert.alert('Error', 'Hubo un problema al obtener las reparaciones.');
        setCargando(false);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  // Función para manejar agregar o editar una reparación
  const handleGuardarReparacion = async (reparacion, isEdit = false) => {
    if (isEdit) {
      // Actualizar reparación existente
      try {
        const reparacionRef = doc(db, 'reparaciones', reparacion.id);
        await updateDoc(reparacionRef, reparacion);

        mostrarMensajeAlerta('Reparación actualizada exitosamente.');
      } catch (error) {
        console.error('Error al actualizar la reparación:', error);
        Alert.alert('Error', 'Hubo un problema al actualizar la reparación.');
      }
    } else {
      // Agregar nueva reparación
      try {
        const reparacionesCollection = collection(db, 'reparaciones');
        await addDoc(reparacionesCollection, reparacion);

        mostrarMensajeAlerta('Reparación guardada exitosamente.');
      } catch (error) {
        console.error('Error al guardar la reparación:', error);
        Alert.alert('Error', 'Hubo un problema al guardar la reparación.');
      }
    }

    setMostrarFormularioReparacion(false);
  };

  // Filtrar reparaciones recientes (menos de 1 hora)
  const obtenerReparacionesRecientes = () => {
    const ahora = new Date();
    const unaHoraEnMs = 1 * 60 * 60 * 1000;

    return reparaciones.filter((reparacion) => {
      const { fechaRecepcion, horaRecepcion } = reparacion.programacion;
      const fechaHoraRecepcion = new Date(`${fechaRecepcion}T${horaRecepcion}`);
      const diferencia = ahora - fechaHoraRecepcion;
      return diferencia <= unaHoraEnMs;
    });
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Contenido Principal */}
      <View style={estilos.contenido}>
        {/* Tarjetas de Estadísticas */}
        {cargando ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <View style={estilos.tarjetas}>
            <TarjetaEstadistica
              icono="construct"
              titulo="Reparaciones Totales"
              valor={estadisticas.totalReparaciones}
              color="#1E90FF"
            />
            <TarjetaEstadistica
              icono="list"
              titulo="Pendientes"
              valor={estadisticas.reparacionesPendientes}
              color="#FFA500"
            />
            <TarjetaEstadistica
              icono="pie-chart"
              titulo="Completadas Hoy"
              valor={estadisticas.reparacionesCompletadasHoy}
              color="#32CD32"
            />
            <TarjetaEstadistica
              icono="time"
              titulo="Tiempo Promedio"
              valor={estadisticas.tiempoPromedio}
              color="#800080"
            />
          </View>
        )}

        {/* Acciones Rápidas */}
        <View style={estilos.accionesRapidas}>
          <Text style={estilos.subtitulo}>Acciones Rápidas</Text>
          <View style={estilos.botonesAccion}>
            <TouchableOpacity
              style={estilos.botonAccion}
              onPress={() => {
                setReparacionParaEditar(null); // Resetear cualquier edición previa
                setMostrarFormularioReparacion(true);
              }}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={estilos.textoBoton}>Nueva Reparación</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={estilos.botonAccionSecundario}
              onPress={() => navigation.navigate('Servicios')}
            >
              <Ionicons name="list" size={24} color="#555" />
              <Text style={estilos.textoBotonSecundario}>Ver Lista</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reparaciones Recientes */}
        <View style={estilos.reparacionesRecientes}>
          <Text style={estilos.subtitulo}>Reparaciones Recientes</Text>
          {cargando ? (
            <ActivityIndicator size="small" color="#1E90FF" />
          ) : obtenerReparacionesRecientes().length === 0 ? (
            <Text style={estilos.noReparaciones}>No hay reparaciones recientes.</Text>
          ) : (
            obtenerReparacionesRecientes().map((reparacion) => (
              <ReparacionItem
                key={reparacion.id}
                reparacion={reparacion}
                actualizarEstado={actualizarEstadoReparacion}
                editarReparacion={editarReparacion}
                eliminarReparacion={eliminarReparacion}
              />
            ))
          )}
        </View>
      </View>

      {/* Modal para Nueva/Editar Reparación */}
      <Modal visible={mostrarFormularioReparacion} animationType="slide">
        <NuevaReparacionForm
          setMostrarFormularioReparacion={setMostrarFormularioReparacion}
          reparacionParaEditar={reparacionParaEditar}
          mostrarMensajeAlerta={mostrarMensajeAlerta}
          handleGuardarReparacion={handleGuardarReparacion} // Asegúrate de pasar esta prop
        />
      </Modal>

      {/* Alerta Global */}
      {mostrarAlerta && <Alerta mensaje={mensajeAlerta} />}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  contenido: {
    padding: 20,
  },
  tarjetas: {
    marginBottom: 25,
  },
  accionesRapidas: {
    marginBottom: 25,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  botonesAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF', // Azul claro
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBoton: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  botonAccionSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textoBotonSecundario: {
    color: '#555',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  reparacionesRecientes: {
    marginBottom: 25,
  },
  noReparaciones: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginTop: 10,
  },
  alerta: {
    position: 'absolute',
    bottom: 20,
    left: '10%',
    right: '10%',
    backgroundColor: '#32CD32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoAlerta: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Inicio;
