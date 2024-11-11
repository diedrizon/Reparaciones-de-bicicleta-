// Importación de React y los hooks useState y useEffect para manejar el estado y efectos secundarios
import React, { useState, useEffect } from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View, // Contenedor básico para otros componentes
  Text, // Componente para mostrar texto
  ScrollView, // Componente para crear una vista desplazable
  StyleSheet, // Para definir estilos de manera estructurada
  TouchableOpacity, // Componente que responde a toques, usado para crear botones interactivos
  TextInput, // Componente para recibir entrada de texto del usuario
  ActivityIndicator, // Indicador de carga animado
  Alert, // Componente para mostrar alertas nativas en dispositivos
  Image, // Componente para mostrar imágenes
  Keyboard, // Para interactuar con el teclado
  TouchableWithoutFeedback, // Componente que captura toques sin mostrar retroalimentación visual
} from "react-native";

// Importación de iconos de Ionicons para usar en los botones y elementos interactivos
import { Ionicons } from "@expo/vector-icons";

// Importación de librerías para seleccionar y manejar imágenes
import * as ImagePicker from "expo-image-picker"; // Para seleccionar imágenes de la galería
import * as FileSystem from "expo-file-system"; // Para manejar operaciones del sistema de archivos

// Importación del componente Picker para seleccionar opciones de una lista desplegable
import { Picker } from "@react-native-picker/picker";

// Importación del componente DateTimePicker para seleccionar fechas y horas
import DateTimePicker from "@react-native-community/datetimepicker";

// Importación de la configuración de Firebase Firestore desde un archivo local
import { db } from "../DataBase/Configuraciones";

// Importación de funciones de Firebase Firestore para manejar datos
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

// Componente funcional NuevaReparacionForm que maneja el formulario para crear o editar una reparación.
const NuevaReparacionForm = ({
  setMostrarFormularioReparacion,
  reparacionParaEditar,
  mostrarMensajeAlerta,
}) => {
  // Estado para almacenar la información de una nueva reparación o la reparación a editar
  const [nuevaReparacion, setNuevaReparacion] = useState({
    cliente: { nombre: "", contacto: "" },
    bicicleta: { marca: "", modelo: "", tipo: "", imagen: null },
    detallesReparacion: { descripcionProblema: "", tipoServicio: "" },
    gestionOrden: { estado: "Pendiente", entregaEstimada: "" },
    programacion: {
      fechaRecepcion: "",
      horaRecepcion: "",
      fechaEntrega: "",
      horaEntrega: "",
    },
  });

  // Estado para controlar la visibilidad del DateTimePicker
  const [showPicker, setShowPicker] = useState(false);

  // Estado para definir el modo del picker ('date' o 'time')
  const [pickerMode, setPickerMode] = useState("date");

  // Estado para almacenar qué campo está siendo seleccionado por el picker
  const [currentPickerField, setCurrentPickerField] = useState(null);

  // Estado para indicar si hay una operación de carga en progreso
  const [cargando, setCargando] = useState(false);

  // Lista de marcas disponibles para la bicicleta
  const listaMarcas = [
    "Giant",
    "Trek",
    "Specialized",
    "Cannondale",
    "Scott",
    "Bianchi",
    "Merida",
    "Fuji",
  ];

  // Lista de tipos de servicio disponibles
  const tiposServicio = [
    "Reparación",
    "Mantenimiento",
    "Inspección",
    "Personalización",
  ];

  // Efecto secundario para actualizar el estado cuando se recibe la reparación a editar
  useEffect(() => {
    if (reparacionParaEditar) {
      setNuevaReparacion(reparacionParaEditar);
    }
  }, [reparacionParaEditar]);

  // Función para seleccionar una imagen de la galería
  const seleccionarImagen = async () => {
    // Solicitar permiso para acceder a la galería de imágenes
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos permiso para acceder a tu galería de imágenes."
      );
      return;
    }

    // Lanzar el selector de imágenes
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
      allowsEditing: true, // Permite editar la imagen antes de seleccionarla
      aspect: [4, 3], // Relación de aspecto de la imagen
      quality: 1, // Calidad de la imagen
    });

    // Si el usuario no canceló la selección
    if (!resultado.canceled) {
      try {
        const uri = resultado.assets[0].uri; // Obtener la URI de la imagen seleccionada
        const nombreArchivo = uri.split("/").pop(); // Obtener el nombre del archivo
        const nuevoPath = `${FileSystem.documentDirectory}${nombreArchivo}`; // Definir el nuevo path dentro de la app

        // Copiar la imagen al directorio de documentos de la app
        await FileSystem.copyAsync({
          from: uri,
          to: nuevoPath,
        });

        // Actualizar el estado con la nueva URI de la imagen
        setNuevaReparacion((prevState) => ({
          ...prevState,
          bicicleta: { ...prevState.bicicleta, imagen: nuevoPath },
        }));

        // Mostrar un mensaje de éxito
        Alert.alert("Éxito", "Imagen seleccionada y guardada exitosamente.");
      } catch (error) {
        console.error("Error al seleccionar la imagen:", error);
        Alert.alert(
          "Error",
          `Hubo un error al seleccionar la imagen: ${error.message}`
        );
      }
    }
  };

  // Función para establecer una propiedad anidada en el estado
  const setNestedProperty = (path, value) => {
    const keys = path.split("."); // Dividir la ruta en claves individuales
    setNuevaReparacion((prevState) => {
      let newState = { ...prevState }; // Crear una copia del estado actual
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }; // Crear una copia de cada nivel intermedio
        current = current[keys[i]]; // Navegar al siguiente nivel
      }
      current[keys[keys.length - 1]] = value; // Establecer el nuevo valor en la propiedad final
      return newState; // Actualizar el estado
    });
  };

  // Función para abrir el picker
  const abrirPicker = (mode, field) => {
    setPickerMode(mode); // Establecer el modo del picker
    setCurrentPickerField(field); // Establecer el campo actual que se actualizará
    setShowPicker(true); // Mostrar el picker
  };

  // Función para manejar la selección de una fecha o hora
  const onChangePicker = (event, selectedDate) => {
    if (event.type === "dismissed") {
      // Si el usuario canceló la selección, cerrar el picker
      setShowPicker(false);
      setCurrentPickerField(null);
      return;
    }

    const currentDate = selectedDate || new Date(); // Obtener la fecha o hora seleccionada

    if (pickerMode === "date") {
      const fecha = currentDate.toISOString().split("T")[0]; // Formatear la fecha en YYYY-MM-DD
      setNestedProperty(currentPickerField, fecha); // Actualizar el campo correspondiente
    } else if (pickerMode === "time") {
      const hora = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }); // Formatear la hora en HH:MM
      setNestedProperty(currentPickerField, hora); // Actualizar el campo correspondiente
    }

    setShowPicker(false); // Cerrar el picker
    setCurrentPickerField(null); // Resetear el campo actual
  };

  // Función para formatear y validar el nombre del cliente (solo letras y espacios).
  const handleNombreChange = (texto) => {
    const sinNumeros = texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""); // Eliminar caracteres no permitidos
    setNuevaReparacion((prevState) => ({
      ...prevState,
      cliente: { ...prevState.cliente, nombre: sinNumeros }, // Actualizar el nombre del cliente
    }));
  };

  // Función para formatear y validar el teléfono del cliente (solo dígitos y guiones).
  const handleTelefonoChange = (texto) => {
    const numeros = texto.replace(/[^0-9]/g, "").slice(0, 8); // Eliminar caracteres no numéricos y limitar a 8 dígitos
    let formato = numeros;
    if (numeros.length > 4) {
      formato = `${numeros.slice(0, 4)}-${numeros.slice(4)}`; // Formatear como XXXX-XXXX
    }
    setNuevaReparacion((prevState) => ({
      ...prevState,
      cliente: { ...prevState.cliente, contacto: formato }, // Actualizar el contacto del cliente
    }));
  };

  // Función para validar el correo electrónico del cliente
  const esEmailValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar emails
    return regex.test(email);
  };

  // Función para manejar el guardado de la reparación
  const manejarGuardarReparacion = async () => {
    // Validación de los campos
    const telefonoValido =
      nuevaReparacion.cliente.contacto.replace("-", "").length === 8; // Verificar si el teléfono tiene 8 dígitos
    const esContactoEmail = esEmailValido(nuevaReparacion.cliente.contacto); // Verificar si el contacto es un email válido
    const esContactoValido = telefonoValido || esContactoEmail; // El contacto debe ser un teléfono válido o un email válido

    // Validaciones detalladas de cada campo obligatorio
    if (!nuevaReparacion.cliente.nombre.trim()) {
      Alert.alert("Error", "El campo 'Nombre del Cliente' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.cliente.contacto.trim()) {
      Alert.alert("Error", "El campo 'Teléfono del Cliente' es obligatorio.");
      return;
    }

    if (!esContactoValido) {
      Alert.alert(
        "Error",
        "El teléfono debe tener el formato 7845-4646 (8 dígitos) o debe ser un email válido."
      );
      return;
    }

    if (!nuevaReparacion.bicicleta.marca.trim()) {
      Alert.alert("Error", "El campo 'Marca de la Bicicleta' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.bicicleta.modelo.trim()) {
      Alert.alert("Error", "El campo 'Modelo de la Bicicleta' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.bicicleta.tipo.trim()) {
      Alert.alert("Error", "El campo 'Tipo de Bicicleta' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.detallesReparacion.descripcionProblema.trim()) {
      Alert.alert(
        "Error",
        "El campo 'Descripción del Problema' es obligatorio."
      );
      return;
    }

    if (!nuevaReparacion.detallesReparacion.tipoServicio.trim()) {
      Alert.alert("Error", "El campo 'Tipo de Servicio' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.gestionOrden.entregaEstimada.trim()) {
      Alert.alert("Error", "El campo 'Entrega Estimada' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.programacion.fechaRecepcion.trim()) {
      Alert.alert("Error", "El campo 'Fecha de Recepción' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.programacion.fechaEntrega.trim()) {
      Alert.alert("Error", "El campo 'Fecha de Entrega' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.programacion.horaRecepcion.trim()) {
      Alert.alert("Error", "El campo 'Hora de Recepción' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.programacion.horaEntrega.trim()) {
      Alert.alert("Error", "El campo 'Hora de Entrega' es obligatorio.");
      return;
    }

    setCargando(true); // Iniciar el indicador de carga

    try {
      if (reparacionParaEditar) {
        // Si se está editando una reparación existente
        const reparacionRef = doc(db, "reparaciones", reparacionParaEditar.id); // Referencia al documento existente
        await updateDoc(reparacionRef, {
          cliente: nuevaReparacion.cliente,
          bicicleta: nuevaReparacion.bicicleta,
          detallesReparacion: nuevaReparacion.detallesReparacion,
          gestionOrden: nuevaReparacion.gestionOrden,
          programacion: nuevaReparacion.programacion,
          timestamp: new Date().toISOString(), // Actualizar el timestamp
        });

        mostrarMensajeAlerta("Reparación actualizada exitosamente."); // Mostrar mensaje de éxito
      } else {
        // Si se está creando una nueva reparación
        const reparacionData = {
          cliente: nuevaReparacion.cliente,
          bicicleta: {
            marca: nuevaReparacion.bicicleta.marca,
            modelo: nuevaReparacion.bicicleta.modelo,
            tipo: nuevaReparacion.bicicleta.tipo,
            imagen: nuevaReparacion.bicicleta.imagen, // URI de la imagen local
          },
          detallesReparacion: nuevaReparacion.detallesReparacion,
          gestionOrden: nuevaReparacion.gestionOrden,
          programacion: nuevaReparacion.programacion,
          timestamp: new Date().toISOString(), // Timestamp de creación
        };

        const reparacionesCollection = collection(db, "reparaciones"); // Referencia a la colección de reparaciones
        await addDoc(reparacionesCollection, reparacionData); // Agregar el nuevo documento

        mostrarMensajeAlerta("Reparación guardada exitosamente."); // Mostrar mensaje de éxito
      }

      // Resetear el formulario a sus valores iniciales
      setNuevaReparacion({
        cliente: { nombre: "", contacto: "" },
        bicicleta: { marca: "", modelo: "", tipo: "", imagen: null },
        detallesReparacion: { descripcionProblema: "", tipoServicio: "" },
        gestionOrden: { estado: "Pendiente", entregaEstimada: "" },
        programacion: {
          fechaRecepcion: "",
          horaRecepcion: "",
          fechaEntrega: "",
          horaEntrega: "",
        },
      });

      setMostrarFormularioReparacion(false); // Cerrar el formulario
    } catch (error) {
      console.error("Error al guardar la reparación:", error);
      Alert.alert(
        "Error",
        `Hubo un error al guardar la reparación: ${error.message}`
      );
    } finally {
      setCargando(false); // Finalizar el indicador de carga
    }
  };

  return (
    // TouchableWithoutFeedback captura toques fuera del teclado para cerrar el teclado
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={estilos.scrollContainer} // Estilo del contenedor del ScrollView
        style={estilos.scrollView} // Estilo general del ScrollView
        keyboardShouldPersistTaps="handled" // Permite que los toques en componentes internos manejen el evento
      >
        {/* Encabezado del Modal */}
        <View style={estilos.modalHeader}>
          <Text style={estilos.modalTitulo}>
            {reparacionParaEditar ? "Editar Reparación" : "Nueva Reparación"}
          </Text>
          {/* Botón para cerrar el modal */}
          <TouchableOpacity
            onPress={() => setMostrarFormularioReparacion(false)}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Información del Cliente */}
        <View style={estilos.card}>
          <Text style={estilos.subtituloSeccion}>Información del Cliente</Text>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Nombre del Cliente</Text>
              <TextInput
                style={estilos.input}
                placeholder="Nombre del Cliente"
                value={nuevaReparacion.cliente.nombre}
                onChangeText={handleNombreChange} // Maneja cambios en el nombre
                placeholderTextColor="#7a7a7a" // Color del texto del placeholder
                onBlur={Keyboard.dismiss} // Cierra el teclado al salir del campo
              />
            </View>
          </View>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Teléfono del Cliente</Text>
              <TextInput
                style={estilos.input}
                placeholder="Teléfono (XXXX-XXXX)"
                value={nuevaReparacion.cliente.contacto}
                onChangeText={handleTelefonoChange} // Maneja cambios en el teléfono
                placeholderTextColor="#7a7a7a" // Color del texto del placeholder
                keyboardType="number-pad" // Tipo de teclado numérico
                onBlur={Keyboard.dismiss} // Cierra el teclado al salir del campo
              />
            </View>
          </View>
        </View>

        {/* Datos de la Bicicleta */}
        <View style={estilos.card}>
          <Text style={estilos.subtituloSeccion}>Datos de la Bicicleta</Text>

          {/* Sección para seleccionar y mostrar la imagen de la bicicleta */}
          <View style={estilos.imagenBicicleta}>
            {/* Botón para agregar una imagen desde la galería */}
            <View style={estilos.imagenContainer}>
              <TouchableOpacity
                style={estilos.botonAgregarImagen}
                onPress={seleccionarImagen} // Maneja la selección de imagen
              >
                <Ionicons name="camera" size={24} color="#1E90FF" />
                <Text style={estilos.textoAgregarImagen}>Agregar Imagen</Text>
              </TouchableOpacity>
            </View>
            {/* Campo para ingresar la URL de la imagen manualmente */}
            <View style={estilos.imagenContainer}>
              <View style={estilos.inputWrapper}>
                <Text style={estilos.label}>URL de la Imagen</Text>
                <TextInput
                  style={estilos.inputURL}
                  placeholder="URL de la Imagen"
                  value={nuevaReparacion.bicicleta.imagen || ""}
                  onChangeText={(texto) =>
                    setNuevaReparacion((prevState) => ({
                      ...prevState,
                      bicicleta: { ...prevState.bicicleta, imagen: texto },
                    }))
                  }
                  placeholderTextColor="#7a7a7a"
                  keyboardType="url" // Tipo de teclado para URLs
                  onBlur={Keyboard.dismiss} // Cierra el teclado al salir del campo
                />
              </View>
            </View>
          </View>

          {/* Vista previa de la imagen seleccionada */}
          {nuevaReparacion.bicicleta.imagen && (
            <Image
              source={{ uri: nuevaReparacion.bicicleta.imagen }}
              style={estilos.imagenPreview}
            />
          )}

          {/* Selector de Marca de la Bicicleta */}
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Marca de la Bicicleta</Text>
              <View style={estilos.pickerWrapper}>
                <Picker
                  selectedValue={nuevaReparacion.bicicleta.marca}
                  onValueChange={(itemValue) =>
                    setNuevaReparacion((prevState) => ({
                      ...prevState,
                      bicicleta: { ...prevState.bicicleta, marca: itemValue },
                    }))
                  }
                  style={estilos.picker}
                  onBlur={Keyboard.dismiss}
                >
                  <Picker.Item label="Marca de la Bicicleta" value="" />
                  {listaMarcas.map((marca, index) => (
                    <Picker.Item key={index} label={marca} value={marca} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Campo de Modelo de la Bicicleta */}
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Modelo de la Bicicleta</Text>
              <TextInput
                style={estilos.input}
                placeholder="Modelo de la Bicicleta"
                value={nuevaReparacion.bicicleta.modelo}
                onChangeText={(texto) =>
                  setNuevaReparacion((prevState) => ({
                    ...prevState,
                    bicicleta: { ...prevState.bicicleta, modelo: texto },
                  }))
                }
                placeholderTextColor="#7a7a7a"
                onBlur={Keyboard.dismiss}
              />
            </View>
          </View>

          {/* Selector de Tipo de Bicicleta */}
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Tipo de Bicicleta</Text>
              <View style={estilos.pickerWrapper}>
                <Picker
                  selectedValue={nuevaReparacion.bicicleta.tipo}
                  onValueChange={(itemValue) =>
                    setNuevaReparacion((prevState) => ({
                      ...prevState,
                      bicicleta: { ...prevState.bicicleta, tipo: itemValue },
                    }))
                  }
                  style={estilos.picker}
                  onBlur={Keyboard.dismiss}
                >
                  <Picker.Item label="Tipo de Bicicleta" value="" />
                  <Picker.Item label="Carretera" value="Carretera" />
                  <Picker.Item label="Montaña" value="Montaña" />
                  <Picker.Item label="Híbrida" value="Híbrida" />
                  <Picker.Item label="Urbana" value="Urbana" />
                  <Picker.Item label="BMX" value="BMX" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Detalles de la Reparación */}
        <View style={estilos.card}>
          <Text style={estilos.subtituloSeccion}>
            Detalles de la Reparación
          </Text>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Descripción del Problema</Text>
              <TextInput
                style={[estilos.input, estilos.textarea]} // Combina estilos de input y textarea
                placeholder="Descripción del Problema"
                multiline // Permite múltiples líneas de texto
                numberOfLines={3} // Número de líneas visibles
                value={nuevaReparacion.detallesReparacion.descripcionProblema}
                onChangeText={(texto) =>
                  setNuevaReparacion((prevState) => ({
                    ...prevState,
                    detallesReparacion: {
                      ...prevState.detallesReparacion,
                      descripcionProblema: texto,
                    },
                  }))
                }
                placeholderTextColor="#7a7a7a"
                onBlur={Keyboard.dismiss}
              />
            </View>
          </View>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Tipo de Servicio</Text>
              <View style={estilos.pickerWrapper}>
                <Picker
                  selectedValue={
                    nuevaReparacion.detallesReparacion.tipoServicio
                  }
                  onValueChange={(itemValue) =>
                    setNuevaReparacion((prevState) => ({
                      ...prevState,
                      detallesReparacion: {
                        ...prevState.detallesReparacion,
                        tipoServicio: itemValue,
                      },
                    }))
                  }
                  style={estilos.picker}
                  onBlur={Keyboard.dismiss}
                >
                  <Picker.Item label="Tipo de Servicio" value="" />
                  {tiposServicio.map((tipo, index) => (
                    <Picker.Item key={index} label={tipo} value={tipo} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Gestión de la Orden */}
        <View style={estilos.card}>
          <Text style={estilos.subtituloSeccion}>Gestión de la Orden</Text>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Estado de la Orden</Text>
              <View style={estilos.pickerWrapper}>
                <Picker
                  selectedValue={nuevaReparacion.gestionOrden.estado}
                  onValueChange={(itemValue) =>
                    setNuevaReparacion((prevState) => ({
                      ...prevState,
                      gestionOrden: {
                        ...prevState.gestionOrden,
                        estado: itemValue,
                      },
                    }))
                  }
                  style={estilos.picker}
                  onBlur={Keyboard.dismiss}
                >
                  <Picker.Item label="Estado de la Orden" value="" />
                  <Picker.Item label="Pendiente" value="Pendiente" />
                  <Picker.Item label="En progreso" value="En progreso" />
                  <Picker.Item label="Completado" value="Completado" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Selección de Fecha y Hora de Entrega */}
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Entrega Estimada</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() =>
                  abrirPicker("date", "gestionOrden.entregaEstimada")
                } // Abrir picker de fecha para entrega estimada
              >
                <Text
                  style={{
                    color: nuevaReparacion.gestionOrden.entregaEstimada
                      ? "#000"
                      : "#7a7a7a",
                  }}
                >
                  {nuevaReparacion.gestionOrden.entregaEstimada
                    ? `Entrega Estimada: ${nuevaReparacion.gestionOrden.entregaEstimada}`
                    : "Selecciona Fecha de Entrega Estimada"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Hora de Entrega</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() => abrirPicker("time", "programacion.horaEntrega")} // Abrir picker de hora para entrega
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.horaEntrega
                      ? "#000"
                      : "#7a7a7a",
                  }}
                >
                  {nuevaReparacion.programacion.horaEntrega
                    ? `Hora de Entrega: ${nuevaReparacion.programacion.horaEntrega}`
                    : "Selecciona Hora de Entrega"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Programación */}
        <View style={estilos.card}>
          <Text style={estilos.subtituloSeccion}>Programación</Text>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Fecha de Recepción</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() =>
                  abrirPicker("date", "programacion.fechaRecepcion")
                } // Abrir picker de fecha para recepción
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.fechaRecepcion
                      ? "#000"
                      : "#7a7a7a",
                  }}
                >
                  {nuevaReparacion.programacion.fechaRecepcion
                    ? `Fecha de Recepción: ${nuevaReparacion.programacion.fechaRecepcion}`
                    : "Selecciona Fecha de Recepción"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Hora de Recepción</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() =>
                  abrirPicker("time", "programacion.horaRecepcion")
                } // Abrir picker de hora para recepción
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.horaRecepcion
                      ? "#000"
                      : "#7a7a7a",
                  }}
                >
                  {nuevaReparacion.programacion.horaRecepcion
                    ? `Hora de Recepción: ${nuevaReparacion.programacion.horaRecepcion}`
                    : "Selecciona Hora de Recepción"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Agregar Fecha de Entrega */}
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Fecha de Entrega</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() => abrirPicker("date", "programacion.fechaEntrega")} // Abrir picker de fecha para entrega
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.fechaEntrega
                      ? "#000"
                      : "#7a7a7a",
                  }}
                >
                  {nuevaReparacion.programacion.fechaEntrega
                    ? `Fecha de Entrega: ${nuevaReparacion.programacion.fechaEntrega}`
                    : "Selecciona Fecha de Entrega"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mostrar el DateTimePicker si está activo */}
        {showPicker && (
          <DateTimePicker
            value={new Date()} // Valor inicial del picker
            mode={pickerMode} // Modo del picker ('date' o 'time')
            display="default" // Modo de visualización predeterminado
            onChange={onChangePicker} // Función que maneja el cambio de fecha/hora
          />
        )}

        {/* Botón para Guardar o Actualizar la Reparación */}
        <TouchableOpacity
          style={estilos.botonGuardar}
          onPress={manejarGuardarReparacion} // Maneja el guardado de la reparación
          disabled={cargando} // Deshabilita el botón si está cargando
        >
          {cargando ? (
            // Mostrar indicador de carga si está en proceso
            <ActivityIndicator color="#fff" />
          ) : (
            // Mostrar texto del botón dependiendo si es una edición o una nueva reparación
            <Text style={estilos.textoBotonGuardar}>
              {reparacionParaEditar
                ? "Actualizar Reparación"
                : "Guardar Reparación"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

// Definición de los estilos utilizados en el componente
const estilos = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f0f4f7", // Color de fondo general
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60, // Aumentar el padding para evitar que el botón se corte
  },
  modalHeader: {
    flexDirection: "row", // Disposición horizontal de los elementos
    justifyContent: "space-between", // Espacio entre el título y el botón de cerrar
    alignItems: "center", // Alineación vertical al centro
    marginBottom: 20, // Margen inferior de 20 unidades
  },
  modalTitulo: {
    fontSize: 24, // Tamaño de fuente de 24 unidades
    fontWeight: "700", // Peso de fuente fuerte
    color: "#1E90FF", // Color del texto azul claro
  },
  card: {
    marginBottom: 25, // Margen inferior de 25 unidades para separar tarjetas
    padding: 15, // Espaciado interno de 15 unidades
    backgroundColor: "#fff", // Fondo blanco para la tarjeta
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    shadowColor: "#1E90FF", // Color de la sombra (azul claro)
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 2, // Sombra para dispositivos Android
  },
  subtituloSeccion: {
    fontSize: 20, // Tamaño de fuente de 20 unidades
    fontWeight: "600", // Peso de fuente medio
    marginBottom: 15, // Margen inferior de 15 unidades
    color: "#1E90FF", // Color del texto azul claro
  },
  inputContainer: {
    marginBottom: 15, // Margen inferior de 15 unidades para separar campos
  },
  inputWrapper: {
    position: "relative", // Posición relativa para posicionar la etiqueta
  },
  label: {
    position: "absolute", // Posición absoluta para la etiqueta sobre el input
    left: 12, // Posición desde la izquierda
    top: -10, // Posición desde arriba
    backgroundColor: "#fff", // Fondo blanco para la etiqueta
    paddingHorizontal: 5, // Padding horizontal de 5 unidades
    fontSize: 12, // Tamaño de fuente de 12 unidades
    color: "#1E90FF", // Color del texto azul claro
    fontWeight: "600", // Peso de fuente medio
    zIndex: 1, // Asegura que la etiqueta esté por encima de otros elementos
  },
  input: {
    backgroundColor: "#fff", // Fondo blanco para el input
    padding: 12, // Espaciado interno de 12 unidades
    paddingTop: 22, // Espacio para la etiqueta
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    fontSize: 16, // Tamaño de fuente de 16 unidades
    color: "#333", // Color del texto gris oscuro
  },
  inputURL: {
    backgroundColor: "#fff", // Fondo blanco para el input de URL
    padding: 12, // Espaciado interno de 12 unidades
    paddingTop: 22, // Espacio para la etiqueta
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    fontSize: 16, // Tamaño de fuente de 16 unidades
    color: "#333", // Color del texto gris oscuro
    height: 60, // Altura del input
  },
  textarea: {
    height: 100, // Altura del textarea
    textAlignVertical: "top", // Alineación vertical del texto al inicio
  },
  botonGuardar: {
    backgroundColor: "#1E90FF", // Color de fondo azul claro para el botón
    paddingVertical: 15, // Padding vertical de 15 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    alignItems: "center", // Centrar el contenido horizontalmente
    marginTop: 10, // Margen superior de 10 unidades
    shadowColor: "#1E90FF", // Color de la sombra (azul claro)
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.3, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 5, // Sombra para dispositivos Android
  },
  textoBotonGuardar: {
    color: "#fff", // Color del texto blanco
    fontSize: 18, // Tamaño de fuente de 18 unidades
    fontWeight: "700", // Peso de fuente fuerte
  },
  imagenBicicleta: {
    flexDirection: "row", // Disposición horizontal de los elementos
    justifyContent: "space-between", // Espacio entre los elementos
    marginBottom: 15, // Margen inferior de 15 unidades
  },
  imagenContainer: {
    flex: 0.48, // Ocupa aproximadamente el 48% del ancho del contenedor padre
  },
  botonAgregarImagen: {
    flexDirection: "row", // Disposición horizontal de icono y texto
    alignItems: "center", // Alinea verticalmente al centro
    justifyContent: "center", // Centra el contenido horizontalmente
    backgroundColor: "#e0f7fa", // Color de fondo azul claro
    padding: 12, // Espaciado interno de 12 unidades
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    height: 60, // Altura fija del botón
  },
  textoAgregarImagen: {
    color: "#1E90FF", // Color del texto azul claro
    marginLeft: 6, // Margen izquierdo de 6 unidades para separar del icono
    fontWeight: "600", // Peso de fuente medio
    fontSize: 16, // Tamaño de fuente de 16 unidades
  },
  imagenPreview: {
    width: "100%", // Ancho completo de la imagen
    height: 200, // Altura fija de 200 unidades
    borderRadius: 10, // Bordes redondeados con radio de 10 unidades
    marginTop: 10, // Margen superior de 10 unidades
    marginBottom: 20, // Margen inferior de 20 unidades para separar de otros campos
  },
  pickerWrapper: {
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    overflow: "hidden", // Ocultar cualquier contenido que sobresalga del contenedor
    backgroundColor: "#fff", // Fondo blanco para el picker
    paddingTop: 5, // Espaciado superior de 5 unidades
    height: 60, // Altura fija del picker
  },
  picker: {
    height: 60, // Altura fija del picker
    width: "100%", // Ancho completo del picker
    color: "#333", // Color del texto en el picker
    fontSize: 16, // Tamaño de fuente de 16 unidades
  },
  inputFecha: {
    backgroundColor: "#fff", // Fondo blanco para el input de fecha/hora
    padding: 12, // Espaciado interno de 12 unidades
    paddingTop: 22, // Espaciado superior de 22 unidades para la etiqueta
    borderRadius: 8, // Bordes redondeados con radio de 8 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    justifyContent: "center", // Centrar el contenido verticalmente
    height: 60, // Altura fija del input
  },
});

export default NuevaReparacionForm;
