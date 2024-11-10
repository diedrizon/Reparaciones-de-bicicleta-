// screens/Ajustes.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const Ajustes = () => {
  return (
    <ScrollView style={estilos.contenedor}>

      {/* Contenido */}
      <View style={estilos.contenido}>
        <TouchableOpacity style={estilos.botonAjuste}>
          <Text style={estilos.textoBoton}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.botonAjuste}>
          <Text style={estilos.textoBoton}>Notificaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={estilos.botonAjuste}>
          <Text style={estilos.textoBoton}>Preferencias</Text>
        </TouchableOpacity>
      </View>
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
  botonAjuste: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  textoBoton: {
    fontSize: 16,
    color: '#333',
  },
});

export default Ajustes;
