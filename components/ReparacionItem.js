// components/ReparacionItem.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReparacionItem = ({
  reparacion,
  actualizarEstado,
  editarReparacion,
  eliminarReparacion,
}) => {
  const {
    cliente,
    bicicleta,
    detallesReparacion,
    gestionOrden,
    programacion,
    bicicleta: { imagen },
  } = reparacion;

  return (
    <View style={estilos.card}>
      {/* Información del Cliente */}
      <View style={estilos.seccion}>
        <Text style={estilos.titulo}>Cliente: {cliente.nombre}</Text>
        <Text style={estilos.texto}>Contacto: {cliente.contacto}</Text>
      </View>

      {/* Información de la Bicicleta */}
      <View style={estilos.seccion}>
        <Text style={estilos.titulo}>
          Bicicleta: {bicicleta.marca} {bicicleta.modelo}
        </Text>
        <Text style={estilos.texto}>Tipo: {bicicleta.tipo}</Text>
        {imagen && <Image source={{ uri: imagen }} style={estilos.imagen} />}
      </View>

      {/* Detalles de la Reparación */}
      <View style={estilos.seccion}>
        <Text style={estilos.titulo}>Problema: {detallesReparacion.descripcionProblema}</Text>
        <Text style={estilos.texto}>Servicio: {detallesReparacion.tipoServicio}</Text>
      </View>

      {/* Gestión de la Orden */}
      <View style={estilos.seccion}>
        <Text style={estilos.titulo}>Estado: {gestionOrden.estado}</Text>
        <Text style={estilos.texto}>Entrega Estimada: {gestionOrden.entregaEstimada}</Text>
      </View>

      {/* Programación */}
      <View style={estilos.seccion}>
        <Text style={estilos.titulo}>
          Recepción: {programacion.fechaRecepcion} a las {programacion.horaRecepcion}
        </Text>
        <Text style={estilos.texto}>
          Entrega: {programacion.fechaEntrega} a las {programacion.horaEntrega}
        </Text>
      </View>

      {/* Botones para Acciones */}
      <View style={estilos.botonesAccion}>
        <TouchableOpacity
          style={estilos.botonActualizar}
          onPress={() => actualizarEstado(reparacion)}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={estilos.textoBoton}>Actualizar Estado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.botonEditar}
          onPress={() => editarReparacion(reparacion)}
        >
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={estilos.textoBoton}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilos.botonEliminar}
          onPress={() => {
            Alert.alert(
              'Confirmar Eliminación',
              '¿Estás seguro de que deseas eliminar esta reparación?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => eliminarReparacion(reparacion.id),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={estilos.textoBoton}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E90FF',
    marginBottom: 15,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seccion: {
    marginBottom: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E90FF',
  },
  texto: {
    fontSize: 14,
    color: '#555',
  },
  imagen: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  botonesAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botonActualizar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500', // Naranja para destacar
    padding: 10,
    borderRadius: 8,
    flex: 0.32,
    justifyContent: 'center',
  },
  botonEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF', // Azul para editar
    padding: 10,
    borderRadius: 8,
    flex: 0.32,
    justifyContent: 'center',
  },
  botonEliminar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000', // Rojo para eliminar
    padding: 10,
    borderRadius: 8,
    flex: 0.32,
    justifyContent: 'center',
  },
  textoBoton: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ReparacionItem;
