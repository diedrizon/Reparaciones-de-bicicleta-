// Importación de React para utilizar componentes funcionales
import React from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import { View, Text, StyleSheet } from "react-native";

// Definición del componente Alerta
const Alerta = ({ mensaje }) => {
  return (
    // Vista contenedora de la alerta con estilos definidos
    <View style={estilos.alerta}>
      {/* Texto del mensaje de la alerta */}
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
};

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  alerta: {
    backgroundColor: "#d4edda", // Color de fondo verde claro
    borderColor: "#c3e6cb", // Color del borde verde
    borderWidth: 1, // Grosor del borde de 1 unidad
    padding: 10, // Espaciado interno de 10 unidades
    borderRadius: 5, // Bordes redondeados con radio de 5 unidades
    marginBottom: 10, // Margen inferior de 10 unidades para separar alertas
  },
  texto: {
    color: "#155724", // Color del texto verde oscuro
    textAlign: "center", // Alineación del texto al centro
  },
});

export default Alerta;
