// components/NuevaReparacionForm.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../DataBase/Configuraciones';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

const NuevaReparacionForm = ({
  setMostrarFormularioReparacion,
  reparacionParaEditar,
  mostrarMensajeAlerta,
}) => {
  const [nuevaReparacion, setNuevaReparacion] = useState({
    cliente: { nombre: '', contacto: '' },
    bicicleta: { marca: '', modelo: '', tipo: '', imagen: null },
    detallesReparacion: { descripcionProblema: '', tipoServicio: '' },
    gestionOrden: { estado: 'Pendiente', entregaEstimada: '' },
    programacion: {
      fechaRecepcion: '',
      horaRecepcion: '',
      fechaEntrega: '',
      horaEntrega: '',
    },
  });

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' o 'time'
  const [currentPickerField, setCurrentPickerField] = useState(null);
  const [cargando, setCargando] = useState(false);

  const listaMarcas = [
    'Giant',
    'Trek',
    'Specialized',
    'Cannondale',
    'Scott',
    'Bianchi',
    'Merida',
    'Fuji',
  ];
  const tiposServicio = [
    'Reparación',
    'Mantenimiento',
    'Inspección',
    'Personalización',
  ];

  useEffect(() => {
    if (reparacionParaEditar) {
      setNuevaReparacion(reparacionParaEditar);
    }
  }, [reparacionParaEditar]);

  // Función para seleccionar una imagen desde la galería y establecer su URI
  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos permiso para acceder a tu galería de imágenes.'
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled) {
      try {
        const uri = resultado.assets[0].uri;
        const nombreArchivo = uri.split('/').pop();
        const nuevoPath = `${FileSystem.documentDirectory}${nombreArchivo}`;

        // Copiar la imagen al directorio de documentos de la app
        await FileSystem.copyAsync({
          from: uri,
          to: nuevoPath,
        });

        // Actualizar el estado con la nueva URI
        setNuevaReparacion((prevState) => ({
          ...prevState,
          bicicleta: { ...prevState.bicicleta, imagen: nuevoPath },
        }));

        Alert.alert('Éxito', 'Imagen seleccionada y guardada exitosamente.');
      } catch (error) {
        console.error('Error al seleccionar la imagen:', error);
        Alert.alert(
          'Error',
          `Hubo un error al seleccionar la imagen: ${error.message}`
        );
      }
    }
  };

  // Función auxiliar para actualizar propiedades anidadas
  const setNestedProperty = (path, value) => {
    const keys = path.split('.');
    setNuevaReparacion((prevState) => {
      let newState = { ...prevState };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  // Función para abrir el picker
  const abrirPicker = (mode, field) => {
    setPickerMode(mode);
    setCurrentPickerField(field);
    setShowPicker(true);
  };

  // Función para manejar cambios en el picker
  const onChangePicker = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      setCurrentPickerField(null);
      return;
    }

    const currentDate = selectedDate || new Date();

    if (pickerMode === 'date') {
      const fecha = currentDate.toISOString().split('T')[0];
      setNestedProperty(currentPickerField, fecha);
    } else if (pickerMode === 'time') {
      const hora = currentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setNestedProperty(currentPickerField, hora);
    }

    setShowPicker(false);
    setCurrentPickerField(null);
  };

  // Función para validar y formatear el nombre (solo letras y espacios)
  const handleNombreChange = (texto) => {
    const sinNumeros = texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setNuevaReparacion((prevState) => ({
      ...prevState,
      cliente: { ...prevState.cliente, nombre: sinNumeros },
    }));
  };

  // Función para formatear y validar el teléfono (XXXX-XXXX)
  const handleTelefonoChange = (texto) => {
    const numeros = texto.replace(/[^0-9]/g, '').slice(0, 8);
    let formato = numeros;
    if (numeros.length > 4) {
      formato = `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
    }
    setNuevaReparacion((prevState) => ({
      ...prevState,
      cliente: { ...prevState.cliente, contacto: formato },
    }));
  };

  // Función para validar el email (si aplica)
  const esEmailValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Función para manejar el guardado o actualización de una reparación
  const manejarGuardarReparacion = async () => {
    // Validación de los campos
    const telefonoValido = nuevaReparacion.cliente.contacto.replace('-', '').length === 8;
    const esContactoEmail = esEmailValido(nuevaReparacion.cliente.contacto);
    const esContactoValido = telefonoValido || esContactoEmail;

    // Validación detallada
    if (!nuevaReparacion.cliente.nombre.trim()) {
      Alert.alert('Error', "El campo 'Nombre del Cliente' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.cliente.contacto.trim()) {
      Alert.alert(
        'Error',
        "El campo 'Teléfono del Cliente' es obligatorio."
      );
      return;
    }

    if (!esContactoValido) {
      Alert.alert(
        'Error',
        'El teléfono debe tener el formato 7845-4646 (8 dígitos).'
      );
      return;
    }

    if (!nuevaReparacion.bicicleta.marca.trim()) {
      Alert.alert('Error', "El campo 'Marca de la Bicicleta' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.bicicleta.modelo.trim()) {
      Alert.alert('Error', "El campo 'Modelo de la Bicicleta' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.bicicleta.tipo.trim()) {
      Alert.alert('Error', "El campo 'Tipo de Bicicleta' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.detallesReparacion.descripcionProblema.trim()) {
      Alert.alert(
        'Error',
        "El campo 'Descripción del Problema' es obligatorio."
      );
      return;
    }

    if (!nuevaReparacion.detallesReparacion.tipoServicio.trim()) {
      Alert.alert('Error', "El campo 'Tipo de Servicio' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.gestionOrden.entregaEstimada.trim()) {
      Alert.alert('Error', "El campo 'Entrega Estimada' es obligatorio.");
      return;
    }

    if (!nuevaReparacion.programacion.fechaRecepcion.trim()) {
      Alert.alert(
        'Error',
        "El campo 'Fecha de Recepción' es obligatorio."
      );
      return;
    }

    if (!nuevaReparacion.programacion.fechaEntrega.trim()) {
      Alert.alert(
        'Error',
        "El campo 'Fecha de Entrega' es obligatorio."
      );
      return;
    }

    if (!nuevaReparacion.programacion.horaRecepcion.trim()) {
      Alert.alert(
        'Error',
        "El campo 'Hora de Recepción' es obligatorio."
      );
      return;
    }

    if (!nuevaReparacion.programacion.horaEntrega.trim()) {
      Alert.alert(
        'Error',
        "El campo 'Hora de Entrega' es obligatorio."
      );
      return;
    }

    setCargando(true);

    try {
      if (reparacionParaEditar) {
        // Actualizar reparación existente
        const reparacionRef = doc(db, 'reparaciones', reparacionParaEditar.id);
        await updateDoc(reparacionRef, {
          cliente: nuevaReparacion.cliente,
          bicicleta: nuevaReparacion.bicicleta,
          detallesReparacion: nuevaReparacion.detallesReparacion,
          gestionOrden: nuevaReparacion.gestionOrden,
          programacion: nuevaReparacion.programacion,
          timestamp: new Date().toISOString(),
        });

        mostrarMensajeAlerta('Reparación actualizada exitosamente.');
      } else {
        // Crear una nueva reparación
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
          timestamp: new Date().toISOString(),
        };

        const reparacionesCollection = collection(db, 'reparaciones');
        await addDoc(reparacionesCollection, reparacionData);

        mostrarMensajeAlerta('Reparación guardada exitosamente.');
      }

      // Resetear el formulario y cerrar el modal
      setNuevaReparacion({
        cliente: { nombre: '', contacto: '' },
        bicicleta: { marca: '', modelo: '', tipo: '', imagen: null },
        detallesReparacion: { descripcionProblema: '', tipoServicio: '' },
        gestionOrden: { estado: 'Pendiente', entregaEstimada: '' },
        programacion: {
          fechaRecepcion: '',
          horaRecepcion: '',
          fechaEntrega: '',
          horaEntrega: '',
        },
      });
      setMostrarFormularioReparacion(false);
    } catch (error) {
      console.error('Error al guardar la reparación:', error);
      Alert.alert(
        'Error',
        `Hubo un error al guardar la reparación: ${error.message}`
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={estilos.scrollContainer}
        style={estilos.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.modalHeader}>
          <Text style={estilos.modalTitulo}>
            {reparacionParaEditar ? 'Editar Reparación' : 'Nueva Reparación'}
          </Text>
          <TouchableOpacity onPress={() => setMostrarFormularioReparacion(false)}>
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
                onChangeText={handleNombreChange}
                placeholderTextColor="#7a7a7a"
                onBlur={Keyboard.dismiss}
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
                onChangeText={handleTelefonoChange}
                placeholderTextColor="#7a7a7a"
                keyboardType="number-pad"
                onBlur={Keyboard.dismiss}
              />
            </View>
          </View>
        </View>

        {/* Datos de la Bicicleta */}
        <View style={estilos.card}>
          <Text style={estilos.subtituloSeccion}>Datos de la Bicicleta</Text>

          {/* Sección de Imagen */}
          <View style={estilos.imagenBicicleta}>
            <View style={estilos.imagenContainer}>
              <TouchableOpacity
                style={estilos.botonAgregarImagen}
                onPress={seleccionarImagen}
              >
                <Ionicons name="camera" size={24} color="#1E90FF" />
                <Text style={estilos.textoAgregarImagen}>Agregar Imagen</Text>
              </TouchableOpacity>
            </View>
            <View style={estilos.imagenContainer}>
              <View style={estilos.inputWrapper}>
                <Text style={estilos.label}>URL de la Imagen</Text>
                <TextInput
                  style={estilos.inputURL}
                  placeholder="URL de la Imagen"
                  value={nuevaReparacion.bicicleta.imagen || ''}
                  onChangeText={(texto) =>
                    setNuevaReparacion((prevState) => ({
                      ...prevState,
                      bicicleta: { ...prevState.bicicleta, imagen: texto },
                    }))
                  }
                  placeholderTextColor="#7a7a7a"
                  keyboardType="url"
                  onBlur={Keyboard.dismiss}
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

          {/* Select de Marca */}
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

          {/* Input de Modelo */}
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

          {/* Select de Tipo */}
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
          <Text style={estilos.subtituloSeccion}>Detalles de la Reparación</Text>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Descripción del Problema</Text>
              <TextInput
                style={[estilos.input, estilos.textarea]}
                placeholder="Descripción del Problema"
                multiline
                numberOfLines={3}
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
                  selectedValue={nuevaReparacion.detallesReparacion.tipoServicio}
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
                      gestionOrden: { ...prevState.gestionOrden, estado: itemValue },
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
                onPress={() => abrirPicker('date', 'gestionOrden.entregaEstimada')}
              >
                <Text
                  style={{
                    color: nuevaReparacion.gestionOrden.entregaEstimada ? '#000' : '#7a7a7a',
                  }}
                >
                  {nuevaReparacion.gestionOrden.entregaEstimada
                    ? `Entrega Estimada: ${nuevaReparacion.gestionOrden.entregaEstimada}`
                    : 'Selecciona Fecha de Entrega Estimada'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Hora de Entrega</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() => abrirPicker('time', 'programacion.horaEntrega')}
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.horaEntrega ? '#000' : '#7a7a7a',
                  }}
                >
                  {nuevaReparacion.programacion.horaEntrega
                    ? `Hora de Entrega: ${nuevaReparacion.programacion.horaEntrega}`
                    : 'Selecciona Hora de Entrega'}
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
                onPress={() => abrirPicker('date', 'programacion.fechaRecepcion')}
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.fechaRecepcion ? '#000' : '#7a7a7a',
                  }}
                >
                  {nuevaReparacion.programacion.fechaRecepcion
                    ? `Fecha de Recepción: ${nuevaReparacion.programacion.fechaRecepcion}`
                    : 'Selecciona Fecha de Recepción'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={estilos.inputContainer}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Hora de Recepción</Text>
              <TouchableOpacity
                style={estilos.inputFecha}
                onPress={() => abrirPicker('time', 'programacion.horaRecepcion')}
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.horaRecepcion ? '#000' : '#7a7a7a',
                  }}
                >
                  {nuevaReparacion.programacion.horaRecepcion
                    ? `Hora de Recepción: ${nuevaReparacion.programacion.horaRecepcion}`
                    : 'Selecciona Hora de Recepción'}
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
                onPress={() => abrirPicker('date', 'programacion.fechaEntrega')}
              >
                <Text
                  style={{
                    color: nuevaReparacion.programacion.fechaEntrega ? '#000' : '#7a7a7a',
                  }}
                >
                  {nuevaReparacion.programacion.fechaEntrega
                    ? `Fecha de Entrega: ${nuevaReparacion.programacion.fechaEntrega}`
                    : 'Selecciona Fecha de Entrega'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mostrar el DateTimePicker si está activo */}
        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode={pickerMode}
            display="default"
            onChange={onChangePicker}
          />
        )}

        {/* Botón para Guardar */}
        <TouchableOpacity
          style={estilos.botonGuardar}
          onPress={manejarGuardarReparacion}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBotonGuardar}>
              {reparacionParaEditar ? 'Actualizar Reparación' : 'Guardar Reparación'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const estilos = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f0f4f7', // Color de fondo general
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60, // Aumentar el padding para evitar que el botón se corte
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E90FF',
  },
  card: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#fff', // Card blanca
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E90FF', // Bordes azules
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtituloSeccion: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1E90FF',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 12,
    top: -10,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#1E90FF',
    fontWeight: '600',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    paddingTop: 22, // Espacio para la etiqueta
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    fontSize: 16,
    color: '#333',
  },
  inputURL: {
    backgroundColor: '#fff',
    padding: 12,
    paddingTop: 22, // Espacio para la etiqueta
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    fontSize: 16,
    color: '#333',
    height: 60, // Igual altura que otros campos
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: '#1E90FF', // Azul claro
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  textoBotonGuardar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  imagenBicicleta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imagenContainer: {
    flex: 0.48,
  },
  botonAgregarImagen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    height: 60, // Igual altura que el campo URL
  },
  textoAgregarImagen: {
    color: '#1E90FF',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 16,
  },
  imagenPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20, // Añadido margen inferior para separar de los campos siguientes
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    paddingTop: 5, // Espacio para la etiqueta
    height: 60, // Aumentado para evitar que el texto se corte
  },
  picker: {
    height: 60, // Aumentado para mostrar el texto completo
    width: '100%',
    color: '#333',
    fontSize: 16,
  },
  inputFecha: {
    backgroundColor: '#fff',
    padding: 12,
    paddingTop: 22, // Espacio para la etiqueta
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    justifyContent: 'center',
    height: 60, // Aumentado para evitar que el texto se corte
  },
});

export default NuevaReparacionForm;
