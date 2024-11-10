// page/Home.js
import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// Importar Pantallas
import Inicio from "../Screens/Inicio";
import Servicios from "../Screens/Servicios";
import Reportes from "../Screens/Reportes";
import Ajustes from "../Screens/Ajustes";

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  const [headerTitle, setHeaderTitle] = useState("Hola, Bienvenido");

  // Función para actualizar el título del header según la pestaña
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
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={estilos.iconContainer}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={estilos.textContainer}>
          <Text style={estilos.textoHeader}>{headerTitle}</Text>
        </View>
        <View style={estilos.logoContainer}>
          <Image
            source={require('../images/1.png')} // Reemplaza con la ruta correcta de tu logo
            style={estilos.logo}
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Navegación de pestañas */}
      <Tab.Navigator
        initialRouteName="Inicio"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Inicio") {
              iconName = "home";
            } else if (route.name === "Servicios") {
              iconName = "construct";
            } else if (route.name === "Reportes") {
              iconName = "pie-chart";
            } else if (route.name === "Ajustes") {
              iconName = "settings";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        screenListeners={{
          state: (e) => {
            const routeName = e.data.state.routes[e.data.state.index].name;
            updateHeaderTitle(routeName);
          },
        }}
      >
        <Tab.Screen name="Inicio" component={Inicio} />
        <Tab.Screen name="Servicios" component={Servicios} />
        <Tab.Screen name="Reportes" component={Reportes} />
        <Tab.Screen name="Ajustes" component={Ajustes} />
      </Tab.Navigator>
    </View>
  );
};

const estilos = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  iconContainer: {
    padding: 5,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
  },
  textoHeader: {
    color: '#000',
    fontSize: 20, // Aumentado el tamaño del texto
    fontWeight: 'bold',
  },
});

export default HomeScreen;
