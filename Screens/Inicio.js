// Importación de React y los hooks useState y useEffect para manejar el estado y efectos secundarios
import React, { useState, useEffect } from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View, // Contenedor básico para otros componentes
  Text, // Componente para mostrar texto
  ScrollView, // Componente para crear una vista desplazable
  StyleSheet, // Para definir estilos de manera estructurada
  TouchableOpacity, // Componente que responde a toques, usado para botones
  Modal, // Ventana modal para mostrar contenido adicional
  ActivityIndicator, // Indicador de carga animado
  Alert, // Componente para mostrar alertas nativas
} from "react-native";

// Importación de iconos de Ionicons para usar en los componentes
import { Ionicons } from "@expo/vector-icons";

// Importación de la configuración de Firebase Firestore desde un archivo local
import { db } from "../DataBase/Configuraciones";

// Importación de funciones de Firebase Firestore para manejar datos en tiempo real
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore"; // Asegúrate de importar addDoc

// Importación de componentes personalizados para manejar reparaciones
import NuevaReparacionFormulario from "../components/NuevaReparacion";
import ItemReparacion from "../components/ReparacionItem";
import TarjetaEstadistica from "../components/TarjetaEstadistica";
import Alerta from "../components/Alerta";

// Definición del componente Inicio
const Inicio = ({ navigation }) => {
  // Estado para almacenar la lista de reparaciones obtenidas de Firestore
  const [reparaciones, setReparaciones] = useState([]);

  // Estado para controlar la visibilidad del formulario de nueva reparación
  const [mostrarFormularioReparacion, setMostrarFormularioReparacion] =
    useState(false);

  // Estado para almacenar la reparación que se va a editar
  const [reparacionParaEditar, setReparacionParaEditar] = useState(null);

  // Estado para indicar si los datos están cargando
  const [cargando, setCargando] = useState(true);

  // Estado para almacenar el mensaje de alerta
  const [mensajeAlerta, setMensajeAlerta] = useState("");

  // Estado para controlar la visibilidad de la alerta
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // Función para mostrar mensajes de alerta temporales
  const mostrarMensajeAlerta = (mensaje) => {
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000); // Ocultar alerta después de 3 segundos
  };

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

  // Función para editar una reparación
  const editarReparacion = (reparacion) => {
    setReparacionParaEditar(reparacion);
    setMostrarFormularioReparacion(true);
  };

  // Función para calcular estadísticas de reparaciones
  const calcularEstadisticas = (reparacionesData) => {
    const totalReparaciones = reparacionesData.length;
    const reparacionesPendientes = reparacionesData.filter(
      (r) => r.gestionOrden.estado === "Pendiente"
    ).length;
    const reparacionesCompletadasHoy = reparacionesData.filter(
      (r) =>
        r.gestionOrden.estado === "Completado" &&
        r.programacion.fechaEntrega === new Date().toISOString().split("T")[0]
    ).length;

    // Calcular el tiempo promedio de reparaciones completadas
    const reparacionesCompletadas = reparacionesData.filter(
      (r) => r.gestionOrden.estado === "Completado"
    );

    let tiempoTotal = 0; // En minutos
    reparacionesCompletadas.forEach((reparacion) => {
      const { fechaRecepcion, horaRecepcion } = reparacion.programacion;
      const { fechaEntrega, horaEntrega } = reparacion.programacion;

      // Convertir fechas y horas a objetos Date
      const fechaHoraRecepcion = new Date(`${fechaRecepcion}T${horaRecepcion}`);
      const fechaHoraEntrega = new Date(`${fechaEntrega}T${horaEntrega}`);

      const diferenciaMs = fechaHoraEntrega - fechaHoraRecepcion;
      const diferenciaMinutos = diferenciaMs / (1000 * 60);
      tiempoTotal += diferenciaMinutos;
    });

    const tiempoPromedioMinutos =
      reparacionesCompletadas.length > 0
        ? tiempoTotal / reparacionesCompletadas.length
        : 0;

    const horas = Math.floor(tiempoPromedioMinutos / 60);
    const minutos = Math.round(tiempoPromedioMinutos % 60);
    const tiempoPromedio = `${horas}h ${minutos}m`;

    return {
      totalReparaciones,
      reparacionesPendientes,
      reparacionesCompletadasHoy,
      tiempoPromedio,
    };
  };

  // Estado para almacenar las estadísticas calculadas
  const [estadisticas, setEstadisticas] = useState({
    totalReparaciones: 0,
    reparacionesPendientes: 0,
    reparacionesCompletadasHoy: 0,
    tiempoPromedio: "0h 0m",
  });

  // Estado para controlar la carga de datos
  useEffect(() => {
    // Referencia a la colección de reparaciones en Firestore
    const reparacionesRef = collection(db, "reparaciones");

    // Suscripción a los cambios en la colección de reparaciones
    const unsubscribe = onSnapshot(
      reparacionesRef,
      (querySnapshot) => {
        const reparacionesData = [];
        querySnapshot.forEach((doc) => {
          reparacionesData.push({ id: doc.id, ...doc.data() });
        });
        setReparaciones(reparacionesData);
        setEstadisticas(calcularEstadisticas(reparacionesData));
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

  // Función para guardar o actualizar una reparación
  const manejarGuardarReparacion = async (reparacion, isEdit = false) => {
    if (isEdit) {
      // Actualizar reparación existente
      try {
        const reparacionRef = doc(db, "reparaciones", reparacion.id);
        await updateDoc(reparacionRef, reparacion);

        // Mostrar mensaje de éxito
        mostrarMensajeAlerta("Reparación actualizada exitosamente.");
      } catch (error) {
        console.error("Error al actualizar la reparación:", error);
        Alert.alert("Error", "Hubo un problema al actualizar la reparación.");
      }
    } else {
      // Agregar nueva reparación
      try {
        const reparacionesColeccion = collection(db, "reparaciones");
        await addDoc(reparacionesColeccion, reparacion);

        // Mostrar mensaje de éxito
        mostrarMensajeAlerta("Reparación guardada exitosamente.");
      } catch (error) {
        console.error("Error al guardar la reparación:", error);
        Alert.alert("Error", "Hubo un problema al guardar la reparación.");
      }
    }

    // Ocultar el formulario después de guardar
    setMostrarFormularioReparacion(false);
  };

  // Función para obtener las reparaciones recientes
  const obtenerReparacionesRecientes = () => {
    const ahora = new Date();
    const unaHoraEnMs = 1 * 60 * 60 * 1000;

    return reparaciones.filter((reparacion) => {
      const { fechaRecepcion, horaRecepcion } = reparacion.programacion;
      const fechaHoraRecepcion = new Date(`${fechaRecepcion}T${horaRecepcion}`);
      const diferencia = ahora - fechaHoraRecepcion;
      return diferencia <= unaHoraEnMs;
    });
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Contenido Principal */}
      <View style={estilos.contenido}>
        {/* Tarjetas de Estadísticas */}
        {cargando ? (
          // Mostrar indicador de carga mientras se obtienen los datos
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <View style={estilos.tarjetas}>
            {/* Tarjeta para Reparaciones Totales */}
            <TarjetaEstadistica
              icono="construct"
              titulo="Reparaciones Totales"
              valor={estadisticas.totalReparaciones}
              color="#1E90FF" // Azul claro
            />
            {/* Tarjeta para Reparaciones Pendientes */}
            <TarjetaEstadistica
              icono="list"
              titulo="Pendientes"
              valor={estadisticas.reparacionesPendientes}
              color="#FFA500" // Naranja
            />
            {/* Tarjeta para Reparaciones Completadas Hoy */}
            <TarjetaEstadistica
              icono="pie-chart"
              titulo="Completadas Hoy"
              valor={estadisticas.reparacionesCompletadasHoy}
              color="#32CD32" // Verde
            />
            {/* Tarjeta para Tiempo Promedio de Reparaciones */}
            <TarjetaEstadistica
              icono="time"
              titulo="Tiempo Promedio"
              valor={estadisticas.tiempoPromedio}
              color="#800080" // Púrpura
            />
          </View>
        )}

        {/* Acciones Rápidas */}
        <View style={estilos.accionesRapidas}>
          <Text style={estilos.subtitulo}>Acciones Rápidas</Text>
          <View style={estilos.botonesAccion}>
            {/* Botón para agregar una nueva reparación */}
            <TouchableOpacity
              style={estilos.botonAccion}
              onPress={() => {
                setReparacionParaEditar(null); // Resetear cualquier edición previa
                setMostrarFormularioReparacion(true); // Mostrar formulario
              }}
            >
              {/* Icono de agregar reparación */}
              <Ionicons name="add-circle" size={24} color="#fff" />
              {/* Texto del botón */}
              <Text style={estilos.textoBoton}>Nueva Reparación</Text>
            </TouchableOpacity>
            {/* Botón para ver la lista completa de reparaciones */}
            <TouchableOpacity
              style={estilos.botonAccionSecundario}
              onPress={() => navigation.navigate("Servicios")} // Navegar a la pantalla de Servicios
            >
              {/* Icono de lista */}
              <Ionicons name="list" size={24} color="#555" />
              {/* Texto del botón */}
              <Text style={estilos.textoBotonSecundario}>Ver Lista</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reparaciones Recientes */}
        <View style={estilos.reparacionesRecientes}>
          <Text style={estilos.subtitulo}>Reparaciones Recientes</Text>
          {cargando ? (
            // Mostrar indicador de carga si aún se están cargando las reparaciones
            <ActivityIndicator size="small" color="#1E90FF" />
          ) : obtenerReparacionesRecientes().length === 0 ? (
            // Mostrar mensaje si no hay reparaciones recientes
            <Text style={estilos.noReparaciones}>
              No hay reparaciones recientes.
            </Text>
          ) : (
            // Listar reparaciones recientes utilizando el componente personalizado ReparacionItem
            obtenerReparacionesRecientes().map((reparacion) => (
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
      </View>

      {/* Modal para Nueva/Editar Reparación */}
      <Modal visible={mostrarFormularioReparacion} animationType="slide">
        <NuevaReparacionFormulario
          setMostrarFormularioReparacion={setMostrarFormularioReparacion} // Función para ocultar el formulario
          reparacionParaEditar={reparacionParaEditar} // Reparación a editar (si aplica)
          mostrarMensajeAlerta={mostrarMensajeAlerta} // Función para mostrar mensajes de alerta
          handleGuardarReparacion={manejarGuardarReparacion} // Función para guardar la reparación
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
    backgroundColor: "#f0f4f7", // Color de fondo suave
  },
  contenido: {
    padding: 20, // Espaciado interno de 20 unidades
  },
  tarjetas: {
    marginBottom: 25, // Margen inferior para separar las tarjetas
  },
  accionesRapidas: {
    marginBottom: 25, // Margen inferior para separar las acciones rápidas
  },
  subtitulo: {
    fontSize: 20, // Tamaño de fuente de 20 unidades
    fontWeight: "700", // Peso de fuente fuerte
    marginBottom: 15, // Margen inferior de 15 unidades
    color: "#333", // Color del texto gris oscuro
    textAlign: "center", // Alineación del texto al centro
  },
  botonesAccion: {
    flexDirection: "row", // Disposición horizontal de los botones
    justifyContent: "space-between", // Distribuye el espacio entre los botones
  },
  botonAccion: {
    flexDirection: "row", // Disposición horizontal de icono y texto
    alignItems: "center", // Alinea verticalmente al centro
    backgroundColor: "#1E90FF", // Color de fondo azul claro
    padding: 15, // Espaciado interno de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    flex: 0.48, // Ocupa el 48% del ancho del contenedor padre
    justifyContent: "center", // Centra el contenido horizontalmente
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.2, // Opacidad de la sombra para iOS
    shadowRadius: 4, // Radio de la sombra para iOS
    elevation: 3, // Sombra para Android
  },
  textoBoton: {
    color: "#fff", // Color del texto blanco
    marginLeft: 8, // Margen izquierdo de 8 unidades para separar del icono
    fontWeight: "600", // Peso de fuente medio
    fontSize: 16, // Tamaño de fuente de 16 unidades
  },
  botonAccionSecundario: {
    flexDirection: "row", // Disposición horizontal de icono y texto
    alignItems: "center", // Alinea verticalmente al centro
    backgroundColor: "#fff", // Color de fondo blanco
    padding: 15, // Espaciado interno de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    flex: 0.48, // Ocupa el 48% del ancho del contenedor padre
    justifyContent: "center", // Centra el contenido horizontalmente
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#ccc", // Color del borde gris claro
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.1, // Opacidad de la sombra para iOS
    shadowRadius: 4, // Radio de la sombra para iOS
    elevation: 2, // Sombra para Android
  },
  textoBotonSecundario: {
    color: "#555", // Color del texto gris medio
    marginLeft: 8, // Margen izquierdo de 8 unidades para separar del icono
    fontWeight: "600", // Peso de fuente medio
    fontSize: 16, // Tamaño de fuente de 16 unidades
  },
  reparacionesRecientes: {
    marginBottom: 25, // Margen inferior para separar las reparaciones recientes
  },
  noReparaciones: {
    textAlign: "center", // Alineación del texto al centro
    color: "#555", // Color del texto gris medio
    fontSize: 16, // Tamaño de fuente de 16 unidades
    marginTop: 10, // Margen superior de 10 unidades
  },
  alerta: {
    position: "absolute", // Posición absoluta para superponer sobre otros componentes
    bottom: 20, // Distancia desde la parte inferior de la pantalla
    left: "10%", // Distancia desde la parte izquierda de la pantalla
    right: "10%", // Distancia desde la parte derecha de la pantalla
    backgroundColor: "#32CD32", // Color de fondo verde
    padding: 15, // Espaciado interno de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    alignItems: "center", // Alinea los elementos horizontalmente al centro
  },
  textoAlerta: {
    color: "#fff", // Color del texto blanco
    fontWeight: "600", // Peso de fuente medio
    fontSize: 16, // Tamaño de fuente de 16 unidades
  },
});

export default Inicio;
