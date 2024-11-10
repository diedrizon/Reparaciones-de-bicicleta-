// screens/Servicios.js

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import ReparacionItem from '../components/ReparacionItem';
import Alerta from '../components/Alerta';
import { Ionicons } from '@expo/vector-icons';
import NuevaReparacionForm from '../components/NuevaReparacion'; // Si deseas permitir edición desde aquí
import { db } from '../DataBase/Configuraciones';
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Modal } from 'react-native';

const Servicios = ({ navigation }) => {
  const [reparaciones, setReparaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  // Para manejar la edición desde Servicios.js, podrías implementar un modal similar a Inicio.js
  const [mostrarFormularioReparacion, setMostrarFormularioReparacion] = useState(false);
  const [reparacionParaEditar, setReparacionParaEditar] = useState(null);

  useEffect(() => {
    const reparacionesRef = collection(db, 'reparaciones');
    const q = query(reparacionesRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reparacionesData = [];
        querySnapshot.forEach((doc) => {
          reparacionesData.push({ id: doc.id, ...doc.data() });
        });
        setReparaciones(reparacionesData);
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

  // Función para mostrar mensajes de alerta
  const mostrarMensajeAlerta = (mensaje) => {
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  // Función para manejar la edición de una reparación
  const editarReparacion = (reparacion) => {
    setReparacionParaEditar(reparacion);
    setMostrarFormularioReparacion(true);
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Contenido */}
      <View style={estilos.contenido}>
        <Text style={estilos.subtitulo}>Lista de Reparaciones</Text>
        {cargando ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : reparaciones.length === 0 ? (
          <Text style={estilos.noReparaciones}>No hay reparaciones registradas.</Text>
        ) : (
          reparaciones.map((reparacion) => (
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

      {/* Modal para Editar Reparación */}
      <Modal visible={mostrarFormularioReparacion} animationType="slide">
        <NuevaReparacionForm
          setMostrarFormularioReparacion={setMostrarFormularioReparacion}
          reparacionParaEditar={reparacionParaEditar}
          mostrarMensajeAlerta={mostrarMensajeAlerta}
        />
      </Modal>

      {/* Alerta Global Opcional */}
      {mostrarAlerta && <Alerta mensaje={mensajeAlerta} />}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contenido: {
    padding: 20,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  noReparaciones: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginTop: 10,
  },
});

export default Servicios;
