// Importación de React para utilizar componentes funcionales
import React from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View, // Contenedor básico para otros componentes
  Text, // Componente para mostrar texto
  ScrollView, // Componente para crear una vista desplazable
  StyleSheet, // Para definir estilos de manera estructurada
  TouchableOpacity, // Componente que responde a toques, usado para botones
} from "react-native";

// Importación de diferentes librerías de iconos para usar en los botones de ajustes
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

// Definición de los estilos utilizados en el componente Ajustes
const Ajustes = () => {
  return (
    // ScrollView permite que el contenido sea desplazable en caso de que exceda el tamaño de la pantalla
    <ScrollView style={estilos.contenedor}>
      {/* Contenedor principal para los botones de ajustes */}
      <View style={estilos.contenido}>
        {/* Botón para acceder al Perfil */}
        <TouchableOpacity style={[estilos.botonAjuste, estilos.botonPerfil]}>
          {/* Icono de perfil utilizando Ionicons */}
          <Ionicons
            name="person-circle-outline" // Nombre del icono
            size={24} // Tamaño del icono
            color="#3b5998" // Color del icono (azul)
            style={estilos.icono} // Estilo adicional para el icono
          />
          {/* Texto del botón */}
          <Text style={estilos.textoBoton}>Perfil</Text>
        </TouchableOpacity>

        {/* Botón para acceder a Notificaciones */}
        <TouchableOpacity
          style={[estilos.botonAjuste, estilos.botonNotificaciones]}
        >
          {/* Icono de notificaciones utilizando Ionicons */}
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#f0932b" // Color del icono (naranja)
            style={estilos.icono}
          />
          <Text style={estilos.textoBoton}>Notificaciones</Text>
        </TouchableOpacity>

        {/* Botón para acceder a Preferencias */}
        <TouchableOpacity
          style={[estilos.botonAjuste, estilos.botonPreferencias]}
        >
          {/* Icono de configuración utilizando Ionicons */}
          <Ionicons
            name="settings-outline"
            size={24}
            color="#20bf6b" // Color del icono (verde)
            style={estilos.icono}
          />
          <Text style={estilos.textoBoton}>Preferencias</Text>
        </TouchableOpacity>

        {/* Botón para acceder a Privacidad */}
        <TouchableOpacity
          style={[estilos.botonAjuste, estilos.botonPrivacidad]}
        >
          {/* Icono de privacidad utilizando MaterialIcons */}
          <MaterialIcons
            name="privacy-tip"
            size={24}
            color="#e74c3c" // Color del icono (rojo)
            style={estilos.icono}
          />
          <Text style={estilos.textoBoton}>Privacidad</Text>
        </TouchableOpacity>

        {/* Botón para acceder a Seguridad */}
        <TouchableOpacity style={[estilos.botonAjuste, estilos.botonSeguridad]}>
          {/* Icono de bloqueo utilizando FontAwesome */}
          <FontAwesome
            name="lock"
            size={24}
            color="#4b7bec" // Color del icono (azul claro)
            style={estilos.icono}
          />
          <Text style={estilos.textoBoton}>Seguridad</Text>
        </TouchableOpacity>

        {/* Botón para acceder a Ayuda */}
        <TouchableOpacity style={[estilos.botonAjuste, estilos.botonAyuda]}>
          {/* Icono de ayuda utilizando Ionicons */}
          <Ionicons
            name="help-circle-outline"
            size={24}
            color="#e67e22" // Color del icono (naranja oscuro)
            style={estilos.icono}
          />
          <Text style={estilos.textoBoton}>Ayuda</Text>
        </TouchableOpacity>

        {/* Botón para acceder a Acerca de */}
        <TouchableOpacity style={[estilos.botonAjuste, estilos.botonAcercaDe]}>
          {/* Icono de información utilizando MaterialIcons */}
          <MaterialIcons
            name="info-outline"
            size={24}
            color="#34495e" // Color del icono (gris oscuro)
            style={estilos.icono}
          />
          <Text style={estilos.textoBoton}>Acerca de</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/**
 * Definición de los estilos utilizados en el componente Ajustes.
 */
const estilos = StyleSheet.create({
  // Estilo para el contenedor principal del ScrollView
  contenedor: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: "#f5f7fa", // Color de fondo claro
  },

  // Estilo para el contenedor que envuelve los botones de ajustes
  contenido: {
    padding: 20, // Espaciado interno de 20 unidades
  },

  // Estilo base para cada botón de ajuste
  botonAjuste: {
    flexDirection: "row", // Disposición horizontal de los elementos internos (icono y texto)
    alignItems: "center", // Alinea los elementos verticalmente al centro
    backgroundColor: "#ffffff", // Color de fondo blanco para el botón
    padding: 15, // Espaciado interno de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    marginBottom: 15, // Margen inferior de 15 unidades para separar los botones
    elevation: 3, // Sombra para dispositivos Android, simulando elevación
    shadowColor: "#000", // Color de la sombra para dispositivos iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS (0 horizontal, 2 vertical)
    shadowOpacity: 0.15, // Opacidad de la sombra para iOS
    shadowRadius: 4, // Radio de la sombra para iOS, determina el desenfoque
  },

  // Estilo para los iconos dentro de los botones
  icono: {
    marginRight: 15, // Margen derecho de 15 unidades para separar el icono del texto
  },

  // Estilo para el texto dentro de los botones
  textoBoton: {
    fontSize: 17, // Tamaño de la fuente de 17 unidades
    color: "#333", // Color del texto gris oscuro
    fontWeight: "500", // Peso de la fuente medio para resaltar el texto
  },

  // Estilos específicos para cada botón individual, agregando una barra lateral de color
  botonPerfil: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#3b5998", // Color de la barra lateral (azul Facebook)
  },
  botonNotificaciones: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#f0932b", // Color de la barra lateral (naranja)
  },
  botonPreferencias: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#20bf6b", // Color de la barra lateral (verde)
  },
  botonPrivacidad: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#e74c3c", // Color de la barra lateral (rojo)
  },
  botonSeguridad: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#4b7bec", // Color de la barra lateral (azul claro)
  },
  botonAyuda: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#e67e22", // Color de la barra lateral (naranja oscuro)
  },
  botonAcercaDe: {
    borderLeftWidth: 5, // Ancho de la barra lateral izquierda de 5 unidades
    borderLeftColor: "#34495e", // Color de la barra lateral (gris oscuro)
  },
});

// Exporta el componente para que pueda ser utilizado en otras partes de la aplicación
export default Ajustes;
