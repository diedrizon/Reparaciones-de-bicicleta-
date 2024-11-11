// Importación de React y el hook useState para manejar el estado del componente
import React, { useState } from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View, // Contenedor básico para otros componentes
  TextInput, // Campo de entrada de texto
  TouchableOpacity, // Botón que responde a toques
  Text, // Componente para mostrar texto
  Image, // Componente para mostrar imágenes
  StyleSheet, // Para definir estilos
  ActivityIndicator, // Indicador de carga
  Modal, // Ventana modal para mostrar mensajes
} from "react-native";

// Importación de la función para iniciar sesión con email y contraseña desde Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";

// Importación de la configuración de autenticación de Firebase desde un archivo local
import { auth } from "../DataBase/Configuraciones";

// Importación de íconos de Ionicons para mostrar el icono de mostrar/ocultar contraseña
import Icon from "react-native-vector-icons/Ionicons";

// Definición del componente funcional PantallaInicioSesion que recibe 'navigation' como prop
const PantallaInicioSesion = ({ navigation }) => {
  // Estado para almacenar el correo electrónico ingresado por el usuario
  const [correo, setCorreo] = useState("");

  // Estado para almacenar la contraseña ingresada por el usuario
  const [contrasena, setContrasena] = useState("");

  // Estado para controlar si la contraseña está oculta (true) o visible (false)
  const [ocultarContrasena, setOcultarContrasena] = useState(true);

  // Estado para mostrar un indicador de carga mientras se realiza la autenticación
  const [cargando, setCargando] = useState(false);

  // Estado para controlar la visibilidad del modal que muestra mensajes de error
  const [modalVisible, setModalVisible] = useState(false);

  // Estado para almacenar el mensaje que se mostrará en el modal de error
  const [mensajeModal, setMensajeModal] = useState("");

  // Función que obtiene el mensaje de error correspondiente al código de error recibido
  const obtenerMensajeError = (codigoError) => {
    // Objeto que mapea códigos de error a mensajes personalizados
    const errores = {
      "auth/invalid-email":
        "El correo electrónico no es válido. Por favor, verifica e intenta nuevamente.",
      "auth/user-disabled":
        "Este usuario ha sido deshabilitado. Contacta al soporte para más información.",
      "auth/user-not-found":
        "No encontramos un usuario con este correo electrónico.",
      "auth/wrong-password":
        "La contraseña es incorrecta. Por favor, inténtalo de nuevo.",
      "auth/too-many-requests":
        "Demasiados intentos fallidos. Por favor, intenta más tarde.",
      default: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
    };

    // Retorna el mensaje correspondiente al código de error o el mensaje por defecto
    return errores[codigoError] || errores.default;
  };

  // Función para manejar el inicio de sesión con email y contraseña
  const manejarInicioSesion = () => {
    // Reiniciar el mensaje de error antes de comenzar el proceso de inicio de sesión
    setMensajeModal("");

    // Validar que el campo de correo electrónico no esté vacío
    if (!correo.trim()) {
      setMensajeModal("Por favor, ingresa tu correo electrónico.");
      setModalVisible(true);
      return;
    }

    // Expresión regular para validar el formato del correo electrónico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      setMensajeModal("Ingresa un correo electrónico válido.");
      setModalVisible(true);
      return;
    }

    // Verificar que el correo electrónico termine con @gmail.com
    if (!correo.endsWith("@gmail.com")) {
      setMensajeModal("El correo debe ser de @gmail.com.");
      setModalVisible(true);
      return;
    }

    // Validar que el campo de contraseña no esté vacío
    if (!contrasena) {
      setMensajeModal("Introduce tu contraseña.");
      setModalVisible(true);
      return;
    }

    // Asegurar que la contraseña tenga al menos 6 caracteres
    if (contrasena.length < 6) {
      setMensajeModal("La contraseña debe tener al menos 6 caracteres.");
      setModalVisible(true);
      return;
    }

    // Mostrar el indicador de carga mientras se realiza la autenticación
    setCargando(true);

    // Intentar autenticar al usuario con Firebase usando el correo y la contraseña proporcionados
    signInWithEmailAndPassword(auth, correo, contrasena)
      .then(() => {
        // Ocultar el indicador de carga una vez completada la autenticación
        setCargando(false);
        // Navegar a la pantalla principal (Home) después de un inicio de sesión exitoso
        navigation.navigate("Home");
      })
      .catch((error) => {
        // Ocultar el indicador de carga en caso de error
        setCargando(false);
        // Obtener el mensaje de error personalizado basado en el código de error de Firebase
        const mensaje = obtenerMensajeError(error.code);
        // Actualizar el mensaje del modal y mostrarlo
        setMensajeModal(mensaje);
        setModalVisible(true);
      });
  };

  return (
    <View style={estilos.contenedor}>
      {/* Logo de la aplicación */}
      <Image
        source={require("../images/1.png")} // Ruta de la imagen del logo
        style={estilos.logo} // Aplicación de estilos al logo
        resizeMode="contain" // Ajuste de la imagen para que contenga sin distorsionar
      />

      {/* Campo de texto para ingresar el correo electrónico */}
      <TextInput
        placeholder="Correo Electrónico" // Texto de ejemplo dentro del campo
        value={correo} // Valor actual del estado 'correo'
        onChangeText={setCorreo} // Función para actualizar el estado 'correo' al cambiar el texto
        keyboardType="email-address" // Tipo de teclado optimizado para emails
        style={estilos.input} // Aplicación de estilos al campo de texto
        placeholderTextColor="#7a7a7a" // Color del texto del placeholder
        autoCapitalize="none" // Deshabilita la capitalización automática
      />

      {/* Contenedor para el campo de contraseña y el icono de mostrar/ocultar */}
      <View style={estilos.contenedorContrasena}>
        {/* Campo de texto para ingresar la contraseña */}
        <TextInput
          placeholder="Contraseña" // Texto de ejemplo dentro del campo
          value={contrasena} // Valor actual del estado 'contrasena'
          onChangeText={setContrasena} // Función para actualizar el estado 'contrasena' al cambiar el texto
          secureTextEntry={ocultarContrasena} // Controla si la contraseña está oculta
          style={estilos.inputContrasena} // Aplicación de estilos al campo de contraseña
          placeholderTextColor="#7a7a7a" // Color del texto del placeholder
          autoCapitalize="none" // Deshabilita la capitalización automática
        />
        {/* Botón para alternar la visibilidad de la contraseña */}
        <TouchableOpacity
          onPress={() => setOcultarContrasena(!ocultarContrasena)} // Alterna el estado 'ocultarContrasena'
          style={estilos.icono} // Aplicación de estilos al icono
        >
          {/* Icono que cambia según el estado de 'ocultarContrasena' */}
          <Icon
            name={ocultarContrasena ? "eye-off" : "eye"} // Nombre del icono basado en el estado
            size={24} // Tamaño del icono
            color="#7a7a7a" // Color del icono
          />
        </TouchableOpacity>
      </View>

      {/* Botón para iniciar sesión */}
      <TouchableOpacity
        style={[estilos.boton, cargando && estilos.botonDeshabilitado]} // Aplica estilos básicos y deshabilitados si 'cargando' es true
        onPress={manejarInicioSesion} // Función que se ejecuta al presionar el botón
        disabled={cargando} // Deshabilita el botón si 'cargando' es true
      >
        {cargando ? (
          // Muestra un indicador de carga si se está autenticando
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          // Muestra el texto del botón si no se está cargando
          <Text style={estilos.textoBoton}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      {/* Modal para mostrar mensajes de error o información al usuario */}
      <Modal
        animationType="fade" // Tipo de animación al mostrar el modal
        transparent={true} // Hace que el fondo del modal sea transparente
        visible={modalVisible} // Controla la visibilidad del modal basado en el estado 'modalVisible'
        onRequestClose={() => setModalVisible(false)} // Función que se ejecuta al intentar cerrar el modal
      >
        <View style={estilos.overlayModal}>
          <View style={estilos.modal}>
            {/* Texto que muestra el mensaje del modal */}
            <Text style={estilos.textoModal}>{mensajeModal}</Text>
            {/* Botón para cerrar el modal */}
            <TouchableOpacity
              style={estilos.botonModal} // Aplicación de estilos al botón del modal
              onPress={() => setModalVisible(false)} // Función para cerrar el modal al presionar el botón
            >
              <Text style={estilos.textoBotonModal}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Exporta el componente para que pueda ser utilizado en otras partes de la aplicación
export default PantallaInicioSesion;

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  // Estilo para el contenedor principal de la pantalla
  contenedor: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: "#f4f4f8", // Color de fondo
    alignItems: "center", // Alinea los elementos horizontalmente al centro
    justifyContent: "center", // Alinea los elementos verticalmente al centro
    paddingHorizontal: 30, // Espaciado horizontal interno
  },
  // Estilo para el logo de la aplicación
  logo: {
    width: 120, // Ancho de la imagen
    height: 120, // Alto de la imagen
    marginBottom: 50, // Margen inferior para separar del siguiente elemento
  },
  // Estilo para los campos de texto (correo electrónico)
  input: {
    width: "100%", // Ancho completo del contenedor
    height: 50, // Alto del campo de texto
    borderColor: "#1E90FF", // Color del borde
    borderWidth: 1, // Grosor del borde
    borderRadius: 25, // Radio de las esquinas para bordes redondeados
    paddingHorizontal: 20, // Espaciado interno horizontal
    marginBottom: 20, // Margen inferior para separar del siguiente elemento
    backgroundColor: "#fff", // Color de fondo del campo de texto
    color: "#333", // Color del texto ingresado
    fontSize: 16, // Tamaño de la fuente
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.1, // Opacidad de la sombra para iOS
    shadowRadius: 4, // Radio de la sombra para iOS
    elevation: 2, // Sombra para Android
  },
  // Estilo para el contenedor de la contraseña y el icono
  contenedorContrasena: {
    width: "100%", // Ancho completo del contenedor
    height: 50, // Alto del contenedor
    borderColor: "#1E90FF", // Color del borde
    borderWidth: 1, // Grosor del borde
    borderRadius: 25, // Radio de las esquinas para bordes redondeados
    flexDirection: "row", // Disposición horizontal de los elementos internos
    alignItems: "center", // Alinea los elementos verticalmente al centro
    paddingHorizontal: 20, // Espaciado interno horizontal
    backgroundColor: "#fff", // Color de fondo del contenedor
    marginBottom: 20, // Margen inferior para separar del siguiente elemento
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.1, // Opacidad de la sombra para iOS
    shadowRadius: 4, // Radio de la sombra para iOS
    elevation: 2, // Sombra para Android
  },
  // Estilo específico para el campo de contraseña dentro del contenedor
  inputContrasena: {
    flex: 1, // Ocupa todo el espacio disponible dentro del contenedor
    color: "#333", // Color del texto ingresado
    fontSize: 16, // Tamaño de la fuente
  },
  // Estilo para el icono de mostrar/ocultar contraseña
  icono: {
    padding: 5, // Espaciado interno para el icono
  },
  // Estilo para el botón de inicio de sesión
  boton: {
    width: "100%", // Ancho completo del botón
    height: 50, // Alto del botón
    backgroundColor: "#1E90FF", // Color de fondo del botón
    borderRadius: 25, // Radio de las esquinas para bordes redondeados
    alignItems: "center", // Alinea el contenido horizontalmente al centro
    justifyContent: "center", // Alinea el contenido verticalmente al centro
    marginTop: 10, // Margen superior para separar de elementos anteriores
    elevation: 3, // Sombra para Android
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.25, // Opacidad de la sombra para iOS
    shadowRadius: 3.84, // Radio de la sombra para iOS
  },
  // Estilo adicional para el botón cuando está deshabilitado (cargando)
  botonDeshabilitado: {
    backgroundColor: "#87CEFA", // Color de fondo más claro para indicar deshabilitación
  },
  // Estilo para el texto dentro del botón
  textoBoton: {
    color: "#fff", // Color del texto
    fontSize: 18, // Tamaño de la fuente
    fontWeight: "bold", // Peso de la fuente para texto en negrita
  },
  // Estilos para el overlay que cubre toda la pantalla cuando el modal está visible
  overlayModal: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo semi-transparente negro
    justifyContent: "center", // Centra el contenido verticalmente
    alignItems: "center", // Centra el contenido horizontalmente
  },
  // Estilos para el contenido interno del modal
  modal: {
    width: "80%", // Ancho del modal como porcentaje del contenedor
    backgroundColor: "#fff", // Color de fondo del modal
    borderRadius: 20, // Radio de las esquinas para bordes redondeados
    padding: 35, // Espaciado interno
    alignItems: "center", // Alinea los elementos horizontalmente al centro
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: {
      width: 0,
      height: 2,
    }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.25, // Opacidad de la sombra para iOS
    shadowRadius: 4, // Radio de la sombra para iOS
    elevation: 5, // Sombra para Android
  },
  // Estilos para el texto dentro del modal
  textoModal: {
    marginBottom: 15, // Margen inferior para separar del botón
    textAlign: "center", // Alinea el texto al centro
    fontSize: 16, // Tamaño de la fuente
    color: "#333", // Color del texto
  },
  // Estilos para el botón dentro del modal
  botonModal: {
    backgroundColor: "#1E90FF", // Color de fondo del botón del modal
    borderRadius: 20, // Radio de las esquinas para bordes redondeados
    paddingVertical: 10, // Espaciado vertical interno
    paddingHorizontal: 25, // Espaciado horizontal interno
    elevation: 2, // Sombra para Android
  },
  // Estilos para el texto del botón dentro del modal
  textoBotonModal: {
    color: "#fff", // Color del texto
    fontWeight: "bold", // Peso de la fuente para texto en negrita
    textAlign: "center", // Alinea el texto al centro
    fontSize: 16, // Tamaño de la fuente
  },
});
