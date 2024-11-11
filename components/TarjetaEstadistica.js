// Importación de React para utilizar componentes funcionales
import React from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import { View, Text, StyleSheet } from "react-native";

// Importación de iconos de Ionicons para usar en los componentes
import { Ionicons } from "@expo/vector-icons";

// Definición del componente TarjetaEstadística
const TarjetaEstadistica = ({ icono, titulo, valor, color }) => {
  return (
    // Vista contenedora de la tarjeta con estilos dinámicos para el borde izquierdo
    <View style={[estilos.tarjeta, { borderLeftColor: color }]}>
      {/* Icono de la estadística */}
      <Ionicons name={icono} size={30} color={color} />
      {/* Contenedor para la información de la estadística */}
      <View style={estilos.info}>
        {/* Valor de la estadística */}
        <Text style={estilos.valor}>{valor}</Text>
        {/* Título de la estadística */}
        <Text style={estilos.titulo}>{titulo}</Text>
      </View>
    </View>
  );
};

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: "row", // Disposición horizontal de icono e información
    alignItems: "center", // Alinea verticalmente al centro
    backgroundColor: "#fff", // Color de fondo blanco
    padding: 15, // Espaciado interno de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    marginBottom: 10, // Margen inferior de 10 unidades para separar tarjetas
    borderLeftWidth: 5, // Grosor del borde izquierdo de 5 unidades
    shadowColor: "#1E90FF", // Color de la sombra (azul claro)
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 2, // Sombra para dispositivos Android
  },
  info: {
    marginLeft: 15, // Margen izquierdo de 15 unidades para separar del icono
  },
  valor: {
    fontSize: 22, // Tamaño de fuente de 22 unidades
    fontWeight: "700", // Peso de fuente fuerte
    color: "#333", // Color del texto gris oscuro
  },
  titulo: {
    fontSize: 16, // Tamaño de fuente de 16 unidades
    color: "#666", // Color del texto gris medio
  },
});

export default TarjetaEstadistica;
