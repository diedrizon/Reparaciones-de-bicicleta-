// components/TarjetaEstadistica.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TarjetaEstadistica = ({ icono, titulo, valor, color }) => {
  return (
    <View style={[estilos.tarjeta, { borderLeftColor: color }]}>
      <Ionicons name={icono} size={30} color={color} />
      <View style={estilos.info}>
        <Text style={estilos.valor}>{valor}</Text>
        <Text style={estilos.titulo}>{titulo}</Text>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    marginLeft: 15,
  },
  valor: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  titulo: {
    fontSize: 16,
    color: '#666',
  },
});

export default TarjetaEstadistica;
