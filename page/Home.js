// Importación de React y los hooks useState y useEffect para manejar el estado y efectos secundarios
import React, { useState, useEffect } from "react";

// Importación del navegador de pestañas inferiores de React Navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Importación de los iconos de Ionicons para usarlos en las pestañas
import { Ionicons } from "@expo/vector-icons";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

// Importar Pantallas que se mostrarán en las diferentes pestañas
import Inicio from "../Screens/Inicio";
import Servicios from "../Screens/Servicios";
import Reportes from "../Screens/Reportes";
import Ajustes from "../Screens/Ajustes";

// Creación del objeto Tab para gestionar las pestañas inferiores
const Tab = createBottomTabNavigator();

// Definición del componente HomeScreen
const HomeScreen = ({ navigation }) => {
  // Estado para almacenar y gestionar el título del header
  const [headerTitle, setHeaderTitle] = useState("Hola, Bienvenido");

  // Función para actualizar el título del header basado en la pestaña activa
  const updateHeaderTitle = (routeName) => {
    switch (routeName) {
      case "Inicio":
        setHeaderTitle("Hola, Bienvenido");
        break;
      case "Servicios":
        setHeaderTitle("Lista de servicios");
        break;
      case "Reportes":
        setHeaderTitle("Reporte");
        break;
      case "Ajustes":
        setHeaderTitle("Ajustes");
        break;
      default:
        setHeaderTitle("Hola, Bienvenido");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header personalizado */}
      <View style={estilos.header}>
        {/* Botón para navegar de regreso a la pantalla de login */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={estilos.iconContainer}
        >
          {/* Icono de flecha hacia atrás */}
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Contenedor para el título del header */}
        <View style={estilos.textContainer}>
          <Text style={estilos.textoHeader}>{headerTitle}</Text>
        </View>

        {/* Contenedor para el logo en el header */}
        <View style={estilos.logoContainer}>
          <Image
            source={require("../images/1.png")} // Ruta de la imagen del logo
            style={estilos.logo} // Aplicación de estilos al logo
            resizeMode="contain" // Ajuste de la imagen para que contenga sin distorsionar
          />
        </View>
      </View>

      {/* Navegación de pestañas inferiores */}
      <Tab.Navigator
        initialRouteName="Inicio" // Pestaña inicial que se mostrará al cargar
        screenOptions={({ route }) => ({
          headerShown: false, // Ocultar el header predeterminado de React Navigation
          tabBarIcon: ({ color, size }) => {
            // Configuración de iconos para cada pestaña
            let iconName;

            // Asignar el nombre del icono según el nombre de la ruta
            if (route.name === "Inicio") {
              iconName = "home";
            } else if (route.name === "Servicios") {
              iconName = "construct";
            } else if (route.name === "Reportes") {
              iconName = "pie-chart";
            } else if (route.name === "Ajustes") {
              iconName = "settings";
            }

            // Retornar el componente Ionicons con el nombre, tamaño y color correspondientes
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        // Listener para detectar cambios de estado en la navegación y actualizar el título del header
        screenListeners={{
          state: (e) => {
            // Obtener el nombre de la ruta actualmente activa
            const routeName = e.data.state.routes[e.data.state.index].name;
            // Actualizar el título del header basado en la pestaña activa
            updateHeaderTitle(routeName);
          },
        }}
      >
        {/* Definición de las pestañas y los componentes que renderizarán */}
        <Tab.Screen name="Inicio" component={Inicio} />
        <Tab.Screen name="Servicios" component={Servicios} />
        <Tab.Screen name="Reportes" component={Reportes} />
        <Tab.Screen name="Ajustes" component={Ajustes} />
      </Tab.Navigator>
    </View>
  );
};

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  // Estilo para el header personalizado
  header: {
    height: 80, // Altura del header
    backgroundColor: "transparent", // Fondo transparente
    flexDirection: "row", // Disposición horizontal de los elementos
    alignItems: "center", // Alinea los elementos verticalmente al centro
    paddingHorizontal: 15, // Espaciado horizontal interno
    paddingTop: 40, // Espaciado superior para acomodar el estado (notch)
    justifyContent: "space-between", // Distribuye el espacio entre los elementos
  },
  // Estilo para el contenedor del icono de retroceso
  iconContainer: {
    padding: 5, // Espaciado interno para el icono
  },
  // Estilo para el contenedor del texto del header
  textContainer: {
    flex: 1, // Ocupa todo el espacio disponible entre iconos y logo
    alignItems: "center", // Alinea el texto al centro horizontalmente
  },
  // Estilo para el contenedor del logo en el header
  logoContainer: {
    flexDirection: "row", // Disposición horizontal (aunque solo contiene una imagen)
    alignItems: "center", // Alinea el contenido verticalmente al centro
  },
  // Estilo para la imagen del logo
  logo: {
    width: 30, // Ancho del logo
    height: 30, // Alto del logo
  },
  // Estilo para el texto del header
  textoHeader: {
    color: "#000", // Color del texto
    fontSize: 20, // Tamaño de la fuente
    fontWeight: "bold", // Peso de la fuente para texto en negrita
  },
});

// Exporta el componente para que pueda ser utilizado en otras partes de la aplicación
export default HomeScreen;
