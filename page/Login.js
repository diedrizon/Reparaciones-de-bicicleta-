// LoginScreen.js

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../DataBase/Configuraciones';
import Icon from 'react-native-vector-icons/Ionicons';

const PantallaInicioSesion = ({ navigation }) => {
  // Estado para almacenar el correo electrónico ingresado
  const [correo, setCorreo] = useState('');
  
  // Estado para almacenar la contraseña ingresada
  const [contrasena, setContrasena] = useState('');

  // Estado para controlar la visibilidad de la contraseña
  const [ocultarContrasena, setOcultarContrasena] = useState(true);
  
  // Estado para mostrar el indicador de carga durante la autenticación
  const [cargando, setCargando] = useState(false);
  
  // Estado para controlar la visibilidad del modal de error
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado para almacenar el mensaje que se mostrará en el modal
  const [mensajeModal, setMensajeModal] = useState('');

  /**
   * Función que traduce los códigos de error de Firebase a mensajes personalizados
   * @param {string} codigoError - Código de error proporcionado por Firebase
   * @returns {string} Mensaje de error en español
   */
  const obtenerMensajeError = (codigoError) => {
    const errores = {
      'auth/invalid-email':
        'El correo electrónico no es válido. Por favor, verifica e intenta nuevamente.',
      'auth/user-disabled':
        'Este usuario ha sido deshabilitado. Contacta al soporte para más información.',
      'auth/user-not-found':
        'No encontramos un usuario con este correo electrónico.',
      'auth/wrong-password':
        'La contraseña es incorrecta. Por favor, inténtalo de nuevo.',
      'auth/too-many-requests':
        'Demasiados intentos fallidos. Por favor, intenta más tarde.',
      default: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
    };

    return errores[codigoError] || errores.default;
  };

  /**
   * Función que maneja el proceso de inicio de sesión
   */
  const manejarInicioSesion = () => {
    // Reiniciar el mensaje de error antes de comenzar
    setMensajeModal('');
    
    // Validar que el campo de correo no esté vacío
    if (!correo.trim()) {
      setMensajeModal('Por favor, ingresa tu correo electrónico.');
      setModalVisible(true);
      return;
    }

    // Validar el formato del correo electrónico usando una expresión regular
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      setMensajeModal('Ingresa un correo electrónico válido.');
      setModalVisible(true);
      return;
    }

    // Verificar que el correo electrónico termine con @gmail.com
    if (!correo.endsWith('@gmail.com')) {
      setMensajeModal('El correo debe ser de @gmail.com.');
      setModalVisible(true);
      return;
    }

    // Validar que el campo de contraseña no esté vacío
    if (!contrasena) {
      setMensajeModal('Introduce tu contraseña.');
      setModalVisible(true);
      return;
    }

    // Asegurar que la contraseña tenga al menos 6 caracteres
    if (contrasena.length < 6) {
      setMensajeModal('La contraseña debe tener al menos 6 caracteres.');
      setModalVisible(true);
      return;
    }

    // Mostrar el indicador de carga mientras se autentica
    setCargando(true);

    // Intentar autenticar al usuario con Firebase
    signInWithEmailAndPassword(auth, correo, contrasena)
      .then(() => {
        setCargando(false);
        // Navegar a la pantalla principal después del inicio exitoso
        navigation.navigate('Home');
      })
      .catch((error) => {
        setCargando(false);
        // Obtener el mensaje de error personalizado
        const mensaje = obtenerMensajeError(error.code);
        setMensajeModal(mensaje);
        setModalVisible(true);
      });
  };

  return (
    <View style={estilos.contenedor}>
      {/* Logo de la aplicación */}
      <Image
        source={require('../images/1.png')}
        style={estilos.logo}
        resizeMode="contain"
      />

      {/* Campo para ingresar el correo electrónico */}
      <TextInput
        placeholder="Correo Electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        style={estilos.input}
        placeholderTextColor="#7a7a7a"
        autoCapitalize="none"
      />

      {/* Campo para ingresar la contraseña con opción de mostrar/ocultar */}
      <View style={estilos.contenedorContrasena}>
        <TextInput
          placeholder="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry={ocultarContrasena}
          style={estilos.inputContrasena}
          placeholderTextColor="#7a7a7a"
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setOcultarContrasena(!ocultarContrasena)}
          style={estilos.icono}
        >
          <Icon
            name={ocultarContrasena ? 'eye-off' : 'eye'}
            size={24}
            color="#7a7a7a"
          />
        </TouchableOpacity>
      </View>

      {/* Botón para iniciar sesión */}
      <TouchableOpacity
        style={[estilos.boton, cargando && estilos.botonDeshabilitado]}
        onPress={manejarInicioSesion}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={estilos.textoBoton}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      {/* Modal para mostrar mensajes de error */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.overlayModal}>
          <View style={estilos.modal}>
            <Text style={estilos.textoModal}>{mensajeModal}</Text>
            <TouchableOpacity
              style={estilos.botonModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={estilos.textoBotonModal}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PantallaInicioSesion;

// Definición de estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f4f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 50,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#1E90FF',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Sombra para iOS
    shadowOpacity: 0.1, // Sombra para iOS
    shadowRadius: 4, // Sombra para iOS
    elevation: 2, // Sombra para Android
  },
  contenedorContrasena: {
    width: '100%',
    height: 50,
    borderColor: '#1E90FF',
    borderWidth: 1,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Sombra para iOS
    shadowOpacity: 0.1, // Sombra para iOS
    shadowRadius: 4, // Sombra para iOS
    elevation: 2, // Sombra para Android
  },
  inputContrasena: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  icono: {
    padding: 5,
  },
  boton: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Sombra para iOS
    shadowOpacity: 0.25, // Sombra para iOS
    shadowRadius: 3.84, // Sombra para iOS
  },
  botonDeshabilitado: {
    backgroundColor: '#87CEFA',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos para el overlay del modal
  overlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para el contenido del modal
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // Estilos para el texto dentro del modal
  textoModal: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  // Estilos para el botón dentro del modal
  botonModal: {
    backgroundColor: '#1E90FF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    elevation: 2,
  },
  // Estilos para el texto del botón del modal
  textoBotonModal: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
