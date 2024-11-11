// Importación de React para utilizar componentes funcionales
import React from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

// Importación de iconos de Ionicons para usar en los botones de acción
import { Ionicons } from "@expo/vector-icons";

// Importación de estilos personalizados para la tarjeta de reparación
const ReparacionItem = ({
  reparacion,
  actualizarEstado,
  editarReparacion,
  eliminarReparacion,
}) => {
  // Desestructuración de las propiedades de la reparación para facilitar el acceso
  const {
    cliente,
    bicicleta,
    detallesReparacion,
    gestionOrden,
    programacion,
    bicicleta: { imagen },
  } = reparacion;

  return (
    // Vista contenedora de la tarjeta de reparación con estilos definidos
    <View style={estilos.card}>
      {/* Información del Cliente */}
      <View style={estilos.seccion}>
        {/* Título con nombre del cliente */}
        <Text style={estilos.titulo}>Cliente: {cliente.nombre}</Text>
        {/* Contacto del cliente */}
        <Text style={estilos.texto}>Contacto: {cliente.contacto}</Text>
      </View>

      {/* Información de la Bicicleta */}
      <View style={estilos.seccion}>
        {/* Título con marca y modelo de la bicicleta */}
        <Text style={estilos.titulo}>
          Bicicleta: {bicicleta.marca} {bicicleta.modelo}
        </Text>
        {/* Tipo de bicicleta */}
        <Text style={estilos.texto}>Tipo: {bicicleta.tipo}</Text>
        {/* Imagen de la bicicleta si está disponible */}
        {imagen && <Image source={{ uri: imagen }} style={estilos.imagen} />}
      </View>

      {/* Detalles de la Reparación */}
      <View style={estilos.seccion}>
        {/* Descripción del problema */}
        <Text style={estilos.titulo}>
          Problema: {detallesReparacion.descripcionProblema}
        </Text>
        {/* Tipo de servicio requerido */}
        <Text style={estilos.texto}>
          Servicio: {detallesReparacion.tipoServicio}
        </Text>
      </View>

      {/* Gestión de la Orden */}
      <View style={estilos.seccion}>
        {/* Estado actual de la reparación */}
        <Text style={estilos.titulo}>Estado: {gestionOrden.estado}</Text>
        {/* Fecha estimada de entrega */}
        <Text style={estilos.texto}>
          Entrega Estimada: {gestionOrden.entregaEstimada}
        </Text>
      </View>

      {/* Programación de Recepción y Entrega */}
      <View style={estilos.seccion}>
        {/* Fecha y hora de recepción */}
        <Text style={estilos.titulo}>
          Recepción: {programacion.fechaRecepcion} a las{" "}
          {programacion.horaRecepcion}
        </Text>
        {/* Fecha y hora de entrega */}
        <Text style={estilos.texto}>
          Entrega: {programacion.fechaEntrega} a las {programacion.horaEntrega}
        </Text>
      </View>

      {/* Botones para Acciones */}
      <View style={estilos.botonesAccion}>
        {/* Botón para actualizar el estado de la reparación */}
        <TouchableOpacity
          style={estilos.botonActualizar}
          onPress={() => actualizarEstado(reparacion)}
        >
          {/* Icono de actualización */}
          <Ionicons name="refresh" size={20} color="#fff" />
          {/* Texto del botón */}
          <Text style={estilos.textoBoton}>Actualizar Estado</Text>
        </TouchableOpacity>

        {/* Botón para editar la reparación */}
        <TouchableOpacity
          style={estilos.botonEditar}
          onPress={() => editarReparacion(reparacion)}
        >
          {/* Icono de edición */}
          <Ionicons name="create" size={20} color="#fff" />
          {/* Texto del botón */}
          <Text style={estilos.textoBoton}>Editar</Text>
        </TouchableOpacity>

        {/* Botón para eliminar la reparación */}
        <TouchableOpacity
          style={estilos.botonEliminar}
          onPress={() => {
            // Mostrar una alerta de confirmación antes de eliminar
            Alert.alert(
              "Confirmar Eliminación",
              "¿Estás seguro de que deseas eliminar esta reparación?",
              [
                { text: "Cancelar", style: "cancel" }, // Opción para cancelar
                {
                  text: "Eliminar",
                  style: "destructive",
                  onPress: () => eliminarReparacion(reparacion.id), // Llamar a la función de eliminación
                },
              ]
            );
          }}
        >
          {/* Icono de eliminación */}
          <Ionicons name="trash" size={20} color="#fff" />
          {/* Texto del botón */}
          <Text style={estilos.textoBoton}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  card: {
    backgroundColor: "#fff", // Color de fondo blanco para la tarjeta
    padding: 15, // Espaciado interno de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    marginBottom: 15, // Margen inferior de 15 unidades para separar tarjetas
    shadowColor: "#1E90FF", // Color de la sombra (azul claro)
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 2, // Sombra para dispositivos Android
  },
  seccion: {
    marginBottom: 10, // Margen inferior de 10 unidades para separar secciones
  },
  titulo: {
    fontSize: 16, // Tamaño de fuente de 16 unidades
    fontWeight: "700", // Peso de fuente fuerte
    color: "#1E90FF", // Color del texto azul claro
  },
  texto: {
    fontSize: 14, // Tamaño de fuente de 14 unidades
    color: "#555", // Color del texto gris medio
  },
  imagen: {
    width: "100%", // Ancho completo de la imagen
    height: 150, // Altura fija de 150 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    marginTop: 10, // Margen superior de 10 unidades
  },
  botonesAccion: {
    flexDirection: "row", // Disposición horizontal de los botones
    justifyContent: "space-between", // Distribuye el espacio entre los botones de manera uniforme
    marginTop: 10, // Margen superior de 10 unidades para separar de otras secciones
  },
  botonActualizar: {
    flexDirection: "row", // Disposición horizontal de icono y texto
    alignItems: "center", // Alinea verticalmente al centro
    backgroundColor: "#FFA500", // Color de fondo naranja para destacar
    padding: 10, // Espaciado interno de 10 unidades
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    flex: 0.32, // Ocupa aproximadamente el 32% del ancho del contenedor padre
    justifyContent: "center", // Centra el contenido horizontalmente
  },
  botonEditar: {
    flexDirection: "row", // Disposición horizontal de icono y texto
    alignItems: "center", // Alinea verticalmente al centro
    backgroundColor: "#1E90FF", // Color de fondo azul para editar
    padding: 10, // Espaciado interno de 10 unidades
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    flex: 0.32, // Ocupa aproximadamente el 32% del ancho del contenedor padre
    justifyContent: "center", // Centra el contenido horizontalmente
  },
  botonEliminar: {
    flexDirection: "row", // Disposición horizontal de icono y texto
    alignItems: "center", // Alinea verticalmente al centro
    backgroundColor: "#FF0000", // Color de fondo rojo para eliminar
    padding: 10, // Espaciado interno de 10 unidades
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    flex: 0.32, // Ocupa aproximadamente el 32% del ancho del contenedor padre
    justifyContent: "center", // Centra el contenido horizontalmente
  },
  textoBoton: {
    color: "#fff", // Color del texto blanco
    marginLeft: 5, // Margen izquierdo de 5 unidades para separar del icono
    fontWeight: "600", // Peso de fuente medio
    fontSize: 14, // Tamaño de fuente de 14 unidades
  },
});

export default ReparacionItem;
