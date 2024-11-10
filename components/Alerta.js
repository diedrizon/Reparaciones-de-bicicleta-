// components/Alerta.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Alerta = ({ mensaje }) => {
  return (
    <View style={estilos.alerta}>
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  alerta: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  texto: {
    color: '#155724',
    textAlign: 'center',
  },
});

export default Alerta;
