// Importación de React y los hooks useState y useEffect para manejar el estado y efectos secundarios
import React, { useState, useEffect } from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View, // Contenedor básico para otros componentes
  Text, // Componente para mostrar texto
  ScrollView, // Componente para crear una vista desplazable
  StyleSheet, // Para definir estilos de manera estructurada
  ActivityIndicator, // Indicador de carga animado
  Alert, // Componente para mostrar alertas nativas
} from "react-native";

// Importación de componentes personalizados para manejar reparaciones
import ItemReparacion from "../components/ReparacionItem";
import Alerta from "../components/Alerta";
import NuevaReparacionFormulario from "../components/NuevaReparacion"; // Si deseas permitir edición desde aquí

// Importación de iconos de Ionicons para usar en los componentes
import { Ionicons } from "@expo/vector-icons";

// Importación de la configuración de Firebase Firestore desde un archivo local
import { db } from "../DataBase/Configuraciones";

// Importación de funciones de Firebase Firestore para manejar datos en tiempo real
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Importación del componente Modal de React Native
import { Modal } from "react-native";

// Definición del componente Servicios
const Servicios = ({ navigation }) => {
  // Estado para almacenar la lista de reparaciones obtenidas de Firestore
  const [reparaciones, setReparaciones] = useState([]);

  // Estado para indicar si los datos están cargando
  const [cargando, setCargando] = useState(true);

  // Estado para controlar la visibilidad de la alerta
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // Estado para almacenar el mensaje de alerta
  const [mensajeAlerta, setMensajeAlerta] = useState("");

  // Estado para controlar la visibilidad del formulario de reparación (agregar/editar)
  const [mostrarFormularioReparacion, setMostrarFormularioReparacion] =
    useState(false);

  // Estado para almacenar la reparación que se va a editar
  const [reparacionParaEditar, setReparacionParaEditar] = useState(null);

  // Efecto secundario para obtener las reparaciones de Firestore
  useEffect(() => {
    // Referencia a la colección de reparaciones en Firestore
    const reparacionesRef = collection(db, "reparaciones");

    // Crear una consulta a la colección de reparaciones
    const consulta = query(reparacionesRef);

    // Suscripción a los cambios en la colección de reparaciones
    const unsubscribe = onSnapshot(
      consulta,
      (querySnapshot) => {
        const reparacionesData = [];
        querySnapshot.forEach((doc) => {
          reparacionesData.push({ id: doc.id, ...doc.data() });
        });
        setReparaciones(reparacionesData);
        setCargando(false); // Datos cargados
      },
      (error) => {
        console.error("Error al obtener reparaciones:", error);
        Alert.alert("Error", "Hubo un problema al obtener las reparaciones.");
        setCargando(false); // Finalizar carga en caso de error
      }
    );

    // Cleanup al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Función para actualizar el estado de una reparación en Firestore
  const actualizarEstadoReparacion = async (reparacion) => {
    try {
      // Referencia al documento de la reparación en Firestore
      const reparacionRef = doc(db, "reparaciones", reparacion.id);

      let nuevoEstado;
      const estadoActual = reparacion.gestionOrden.estado;

      // Ciclo para alternar el estado de la reparación
      if (estadoActual === "Pendiente") {
        nuevoEstado = "En progreso";
      } else if (estadoActual === "En progreso") {
        nuevoEstado = "Completado";
      } else {
        nuevoEstado = "Pendiente";
      }

      // Actualizar el estado en Firestore
      await updateDoc(reparacionRef, {
        "gestionOrden.estado": nuevoEstado,
      });

      // Mostrar mensaje de éxito
      mostrarMensajeAlerta("Estado de la reparación actualizado.");
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      Alert.alert("Error", "Hubo un problema al actualizar el estado.");
    }
  };

  // Función para eliminar una reparación de Firestore
  const eliminarReparacion = async (id) => {
    try {
      // Referencia al documento de la reparación en Firestore
      const reparacionRef = doc(db, "reparaciones", id);

      // Eliminar el documento
      await deleteDoc(reparacionRef);

      // Mostrar mensaje de éxito
      mostrarMensajeAlerta("Reparación eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar la reparación:", error);
      Alert.alert("Error", "Hubo un problema al eliminar la reparación.");
    }
  };

  // Función para mostrar un mensaje de alerta
  const mostrarMensajeAlerta = (mensaje) => {
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000); // Ocultar alerta después de 3 segundos
  };

  // Función para editar una reparación
  const editarReparacion = (reparacion) => {
    setReparacionParaEditar(reparacion);
    setMostrarFormularioReparacion(true);
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Contenido Principal */}
      <View style={estilos.contenido}>
        <Text style={estilos.subtitulo}>Lista de Reparaciones</Text>
        {cargando ? (
          // Mostrar indicador de carga mientras se obtienen los datos
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : reparaciones.length === 0 ? (
          // Mostrar mensaje si no hay reparaciones registradas
          <Text style={estilos.noReparaciones}>
            No hay reparaciones registradas.
          </Text>
        ) : (
          // Listar reparaciones utilizando el componente personalizado ItemReparacion
          reparaciones.map((reparacion) => (
            <ItemReparacion
              key={reparacion.id} // Clave única para cada elemento de la lista
              reparacion={reparacion} // Pasar los datos de la reparación al componente
              actualizarEstado={actualizarEstadoReparacion} // Función para actualizar el estado
              editarReparacion={editarReparacion} // Función para editar la reparación
              eliminarReparacion={eliminarReparacion} // Función para eliminar la reparación
            />
          ))
        )}
      </View>

      {/* Modal para Editar Reparación */}
      <Modal visible={mostrarFormularioReparacion} animationType="slide">
        <NuevaReparacionFormulario
          setMostrarFormularioReparacion={setMostrarFormularioReparacion} // Función para ocultar el formulario
          reparacionParaEditar={reparacionParaEditar} // Reparación a editar (si aplica)
          mostrarMensajeAlerta={mostrarMensajeAlerta} // Función para mostrar mensajes de alerta
          handleGuardarReparacion={actualizarEstadoReparacion} // Función para guardar la reparación
        />
      </Modal>

      {/* Alerta Global */}
      {mostrarAlerta && <Alerta mensaje={mensajeAlerta} />}
    </ScrollView>
  );
};

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: "#f3f4f6", // Color de fondo claro
  },
  contenido: {
    padding: 20, // Espaciado interno de 20 unidades
  },
  subtitulo: {
    fontSize: 20, // Tamaño de fuente de 20 unidades
    fontWeight: "700", // Peso de fuente fuerte
    marginBottom: 15, // Margen inferior de 15 unidades
    color: "#333", // Color del texto gris oscuro
  },
  noReparaciones: {
    textAlign: "center", // Alineación del texto al centro
    color: "#555", // Color del texto gris medio
    fontSize: 16, // Tamaño de fuente de 16 unidades
    marginTop: 10, // Margen superior de 10 unidades
  },
});

export default Servicios;
