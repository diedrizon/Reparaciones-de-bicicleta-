// Importación de React y los hooks useState, useEffect, useRef para manejar el estado, efectos secundarios y referencias
import React, { useState, useEffect, useRef } from "react";

// Importación de componentes básicos de React Native para construir la interfaz de usuario
import {
  View, // Contenedor básico para otros componentes
  Text, // Componente para mostrar texto
  ScrollView, // Componente para crear una vista desplazable
  StyleSheet, // Para definir estilos de manera estructurada
  ActivityIndicator, // Indicador de carga animado
  Button, // Componente de botón
  Alert, // Componente para mostrar alertas nativas
  Dimensions, // Para obtener dimensiones de la pantalla
} from "react-native";

// Importación de componentes de gráficos para visualizar datos
import {
  LineChart, // Gráfico de líneas
  BarChart, // Gráfico de barras
  PieChart, // Gráfico de pastel
} from "react-native-chart-kit";

// Importación de la configuración de Firebase Firestore desde un archivo local
import { db } from "../DataBase/Configuraciones";

// Importación de funciones de Firebase Firestore para manejar datos en tiempo real
import { collection, onSnapshot } from "firebase/firestore";

// Importación de librerías para capturar vistas y generar PDFs
import ViewShot from "react-native-view-shot"; // Para capturar vistas como imágenes
import jsPDF from "jspdf"; // Para generar PDFs
import * as FileSystem from "expo-file-system"; // Para manejar el sistema de archivos
import * as Sharing from "expo-sharing"; // Para compartir archivos

// Obtener el ancho de la pantalla y restar 40 para márgenes
const anchoPantalla = Dimensions.get("window").width - 40;

const Reportes = () => {
  // Estado para almacenar la lista de reparaciones obtenidas de Firestore
  const [reparaciones, setReparaciones] = useState([]);

  // Estado para indicar si los datos están cargando
  const [cargando, setCargando] = useState(true);

  // Estados para el resumen del día
  const [totalReparaciones, setTotalReparaciones] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [completadasHoy, setCompletadasHoy] = useState(0);

  // Referencias para capturar los gráficos
  const graficoLineaRef = useRef();
  const graficoBarrasRef = useRef();
  const graficoPastelRef = useRef();
  const graficoBicicletasComunesRef = useRef();
  const graficoTipoBicicletaRef = useRef(); // Asegúrate de que el nombre sea consistente

  // Estados para almacenar datos de los gráficos
  const [datosLinea, setDatosLinea] = useState({});
  const [datosBarras, setDatosBarras] = useState({});
  const [datosPastel, setDatosPastel] = useState([]);
  const [datosBicicletasComunes, setDatosBicicletasComunes] = useState({});
  const [datosTipoBicicleta, setDatosTipoBicicleta] = useState({});

  // Hook useEffect para obtener reparaciones en tiempo real desde Firestore
  useEffect(() => {
    // Referencia a la colección de reparaciones en Firestore
    const reparacionesRefDB = collection(db, "reparaciones");

    // Suscripción a los cambios en la colección de reparaciones
    const unsubscribe = onSnapshot(
      reparacionesRefDB,
      (querySnapshot) => {
        const reparacionesData = [];
        querySnapshot.forEach((doc) => {
          reparacionesData.push({ id: doc.id, ...doc.data() });
        });
        setReparaciones(reparacionesData);
        procesarDatos(reparacionesData); // Procesar datos para los gráficos
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

  // Función para procesar los datos y generar los gráficos
  const procesarDatos = (datos) => {
    // Resumen del Día
    const total = datos.length;
    const pendientesCount = datos.filter(
      (r) => r.gestionOrden.estado === "Pendiente"
    ).length;
    const completadasHoyCount = datos.filter(
      (r) =>
        r.gestionOrden.estado === "Completado" &&
        r.programacion.fechaEntrega === new Date().toISOString().split("T")[0]
    ).length;

    setTotalReparaciones(total);
    setPendientes(pendientesCount);
    setCompletadasHoy(completadasHoyCount);

    // Gráfico de Línea: Reparaciones completadas por día (últimos 7 días)
    const hoy = new Date();
    const dias = [];
    const reparacionesPorDia = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() - i);
      const fechaStr = fecha.toISOString().split("T")[0];
      dias.push(fechaStr.slice(5)); // Formato MM-DD
      const count = datos.filter(
        (r) =>
          r.gestionOrden.estado === "Completado" &&
          r.programacion.fechaEntrega === fechaStr
      ).length;
      reparacionesPorDia.push(count);
    }

    setDatosLinea({
      labels: dias,
      datasets: [
        {
          data: reparacionesPorDia,
          strokeWidth: 2, // Grosor de la línea
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Rojo
        },
      ],
      legend: ["Reparaciones Completadas"],
    });

    // Gráfico de Barras: Reparaciones por tipo de servicio
    const tiposServicio = {};
    datos.forEach((r) => {
      const tipo = r.detallesReparacion.tipoServicio;
      if (tiposServicio[tipo]) {
        tiposServicio[tipo] += 1;
      } else {
        tiposServicio[tipo] = 1;
      }
    });

    setDatosBarras({
      labels: Object.keys(tiposServicio),
      datasets: [
        {
          data: Object.values(tiposServicio),
        },
      ],
    });

    // Gráfico de Pastel: Distribución de estados
    const estados = datos.reduce((acc, r) => {
      const estado = r.gestionOrden.estado;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    const datosPastelFormateados = Object.keys(estados).map(
      (estado, index) => ({
        name: estado,
        population: estados[estado],
        color: coloresPastel[index % coloresPastel.length],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12,
      })
    );

    setDatosPastel(datosPastelFormateados);

    // Gráfico de Barras: Bicicletas Más Comunes
    const bicicletasComunes = {};
    datos.forEach((r) => {
      const marcaModelo = `${r.bicicleta.marca} ${r.bicicleta.modelo}`;
      if (bicicletasComunes[marcaModelo]) {
        bicicletasComunes[marcaModelo] += 1;
      } else {
        bicicletasComunes[marcaModelo] = 1;
      }
    });

    // Ordenar de mayor a menor y tomar las top 10
    const bicicletasOrdenadas = Object.entries(bicicletasComunes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const etiquetasBicicletas = bicicletasOrdenadas.map((item) => item[0]);
    const datosBicicletas = bicicletasOrdenadas.map((item) => item[1]);

    setDatosBicicletasComunes({
      labels: etiquetasBicicletas,
      datasets: [
        {
          data: datosBicicletas,
        },
      ],
    });

    // Gráfico de Barras: Tipo de Bicicleta
    const tiposBicicleta = {};
    datos.forEach((r) => {
      const tipo = r.bicicleta.tipo;
      if (tiposBicicleta[tipo]) {
        tiposBicicleta[tipo] += 1;
      } else {
        tiposBicicleta[tipo] = 1;
      }
    });

    setDatosTipoBicicleta({
      labels: Object.keys(tiposBicicleta),
      datasets: [
        {
          data: Object.values(tiposBicicleta),
        },
      ],
    });
  };

  // Colores para el gráfico de pastel
  const coloresPastel = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  // Función para generar y compartir el PDF de un gráfico específico
  const generarPDFIndividual = async (ref, titulo, etiquetas, datos) => {
    try {
      // Capturar el gráfico como imagen
      const graficoURI = await ref.current.capture();

      // Convertir imagen a base64
      const graficoBase64 = await FileSystem.readAsStringAsync(graficoURI, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Crear el documento PDF
      const documento = new jsPDF();

      // Agregar Título al PDF
      documento.setFontSize(22);
      documento.text(titulo.replace(/_/g, " "), 105, 20, null, null, "center");

      // Agregar Imagen del Gráfico al PDF
      documento.addImage(
        `data:image/png;base64,${graficoBase64}`,
        "PNG",
        15,
        30,
        180,
        100
      ); // Ajustar dimensiones según necesidad

      // Agregar Línea de Separación
      documento.line(15, 135, 195, 135); // Línea horizontal debajo del gráfico

      // Agregar Datos Asociados al Gráfico
      documento.setFontSize(16);
      documento.text("Datos del Gráfico:", 15, 140);
      documento.setFontSize(12);
      const inicioY = 150;
      const alturaLinea = 10;
      etiquetas.forEach((etiqueta, index) => {
        const texto = `${etiqueta}: ${datos[index]}`;
        const posicionY = inicioY + index * alturaLinea;
        // Manejar el salto de página si es necesario
        if (posicionY > 270) {
          // Ajustar según el tamaño de la página
          documento.addPage();
          documento.text("Datos del Gráfico (Continuación):", 15, 20);
          documento.text(
            texto,
            15,
            30 + (index - Math.floor(posicionY / 270)) * alturaLinea
          );
        } else {
          documento.text(texto, 15, posicionY);
        }
      });

      // Guardar el PDF en el sistema de archivos
      const pdfURI =
        FileSystem.cacheDirectory +
        `${titulo.replace(/\s+/g, "_").toLowerCase()}.pdf`;
      await FileSystem.writeAsStringAsync(
        pdfURI,
        documento.output("datauristring").split(",")[1],
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Compartir el PDF generado
      await Sharing.shareAsync(pdfURI, {
        mimeType: "application/pdf",
        dialogTitle: `Compartir ${titulo.replace(/_/g, " ")}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error(`Error al generar el PDF para ${titulo}:`, error);
      Alert.alert(
        "Error",
        `Hubo un problema al generar el reporte para ${titulo.replace(
          /_/g,
          " "
        )}.`
      );
    }
  };

  // Función para calcular el ancho del gráfico
  const calcularAnchoGrafico = (numeroEtiquetas) => {
    const anchoPorEtiqueta = 60; // Ancho por cada etiqueta en píxeles
    const anchoMinimo = anchoPantalla;
    const anchoTotal = numeroEtiquetas * anchoPorEtiqueta;
    return anchoTotal > anchoMinimo ? anchoTotal : anchoMinimo;
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Contenido Principal */}
      <View style={estilos.contenido}>
        {cargando ? (
          // Mostrar indicador de carga mientras se obtienen los datos
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <>
            {/* Resumen del Día */}
            <View style={estilos.reporte}>
              <Text style={estilos.subtitulo}>Resumen del Día</Text>
              <View style={estilos.lineaSeparadora} />
              <Text style={estilos.textoResumen}>
                Total de reparaciones: {totalReparaciones}
              </Text>
              <Text style={estilos.textoResumen}>Pendientes: {pendientes}</Text>
              <Text style={estilos.textoResumen}>
                Completadas hoy: {completadasHoy}
              </Text>
            </View>

            {/* Gráfico de Línea */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>
                Reparaciones Completadas por Día (Últimos 7 Días)
              </Text>
              <View style={estilos.lineaSeparadora} />

              {/* ScrollView Horizontal para el Gráfico de Línea */}
              <ScrollView horizontal>
                <View
                  style={{
                    width: calcularAnchoGrafico(datosLinea.labels.length),
                  }}
                >
                  {/* Contenedor para capturar el gráfico de línea */}
                  <ViewShot
                    ref={graficoLineaRef}
                    options={{ format: "png", quality: 0.9 }}
                  >
                    <LineChart
                      data={datosLinea}
                      width={calcularAnchoGrafico(datosLinea.labels.length)} // Ancho dinámico basado en etiquetas
                      height={300} // Altura aumentada para acomodar las etiquetas
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff", // Fondo del gráfico
                        backgroundGradientTo: "#ffffff", // Fondo del gráfico
                        decimalPlaces: 0, // Número de decimales
                        color: (opacity = 1) =>
                          `rgba(255, 99, 132, ${opacity})`, // Rojo para la línea
                        labelColor: (opacity = 1) =>
                          `rgba(0, 0, 0, ${opacity})`, // Color de las etiquetas
                        style: {
                          borderRadius: 16, // Bordes redondeados del gráfico
                        },
                        propsForDots: {
                          r: "4", // Radio de los puntos
                          strokeWidth: "2", // Grosor del borde de los puntos
                          stroke: "#FF6384", // Color del borde de los puntos
                        },
                      }}
                      bezier // Curvas suaves en el gráfico de línea
                      style={[estilos.grafico, { paddingBottom: 30 }]} // Estilos adicionales para el gráfico con padding inferior
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              <View style={estilos.lineaSeparadoraBoton} />
              {/* Botón para Generar Reporte PDF Individual del Gráfico de Línea */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() =>
                    generarPDFIndividual(
                      graficoLineaRef,
                      "Reparaciones_Completadas_por_Día",
                      datosLinea.labels,
                      datosLinea.datasets[0].data
                    )
                  }
                  color="#FF6384" // Color del botón (rojo)
                />
              </View>
            </View>

            {/* Gráfico de Barras */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>
                Reparaciones por Tipo de Servicio
              </Text>
              <View style={estilos.lineaSeparadora} />

              {/* ScrollView Horizontal para el Gráfico de Barras */}
              <ScrollView horizontal>
                <View
                  style={{
                    width: calcularAnchoGrafico(datosBarras.labels.length),
                  }}
                >
                  {/* Contenedor para capturar el gráfico de barras */}
                  <ViewShot
                    ref={graficoBarrasRef}
                    options={{ format: "png", quality: 0.9 }}
                  >
                    <BarChart
                      data={datosBarras}
                      width={calcularAnchoGrafico(datosBarras.labels.length)} // Ancho dinámico basado en etiquetas
                      height={300} // Altura aumentada para acomodar las etiquetas
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff", // Fondo del gráfico
                        backgroundGradientTo: "#ffffff", // Fondo del gráfico
                        decimalPlaces: 0, // Número de decimales
                        color: (opacity = 1) =>
                          `rgba(54, 162, 235, ${opacity})`, // Azul para las barras
                        labelColor: (opacity = 1) =>
                          `rgba(0, 0, 0, ${opacity})`, // Color de las etiquetas
                        style: {
                          borderRadius: 16, // Bordes redondeados del gráfico
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "", // Líneas sólidas
                        },
                      }}
                      verticalLabelRotation={45} // Rotación de etiquetas para mejor legibilidad
                      style={[estilos.grafico, { paddingBottom: 30 }]} // Estilos adicionales para el gráfico con padding inferior
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              <View style={estilos.lineaSeparadoraBoton} />
              {/* Botón para Generar Reporte PDF Individual del Gráfico de Barras */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() =>
                    generarPDFIndividual(
                      graficoBarrasRef,
                      "Reparaciones_por_Tipo_de_Servicio",
                      datosBarras.labels,
                      datosBarras.datasets[0].data
                    )
                  }
                  color="#36A2EB" // Color del botón (azul)
                />
              </View>
            </View>

            {/* Gráfico de Pastel con Scroll Vertical y Tamaño Reducido */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Distribución de Estados</Text>
              <View style={estilos.lineaSeparadora} />

              {/* ScrollView Vertical dentro de la Tarjeta */}
              <ScrollView style={{ maxHeight: 350 }}>
                <ScrollView horizontal>
                  <View
                    style={{ width: calcularAnchoGrafico(datosPastel.length) }}
                  >
                    {/* Contenedor para capturar el gráfico de pastel */}
                    <ViewShot
                      ref={graficoPastelRef}
                      options={{ format: "png", quality: 0.9 }}
                    >
                      <PieChart
                        data={datosPastel}
                        width={anchoPantalla * 0.8} // Reducir el ancho al 80% del ancho disponible
                        height={200} // Reducir la altura a 200
                        chartConfig={{
                          backgroundGradientFrom: "#ffffff",
                          backgroundGradientTo: "#ffffff",
                          decimalPlaces: 0,
                          color: (opacity = 1) =>
                            `rgba(75, 192, 192, ${opacity})`,
                          labelColor: (opacity = 1) =>
                            `rgba(0, 0, 0, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                      />
                    </ViewShot>
                  </View>
                </ScrollView>

                {/* Botón para Generar Reporte PDF Individual del Gráfico de Pastel */}
                <View style={estilos.botonReporte}>
                  <Button
                    title="Generar Reporte PDF"
                    onPress={() => {
                      // Preparar los datos para el gráfico de pastel
                      const etiquetas = datosPastel.map((item) => item.name);
                      const valores = datosPastel.map(
                        (item) => item.population
                      );
                      generarPDFIndividual(
                        graficoPastelRef,
                        "Distribución_de_Estados",
                        etiquetas,
                        valores
                      );
                    }}
                    color="#4BC0C0" // Color del botón (verde Turquesa)
                  />
                </View>
              </ScrollView>

              <View style={estilos.lineaSeparadoraBoton} />
            </View>

            {/* Gráfico de Bicicletas Más Comunes */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Bicicletas Más Comunes</Text>
              <View style={estilos.lineaSeparadora} />

              {/* ScrollView Horizontal para el Gráfico de Bicicletas Comunes */}
              <ScrollView horizontal>
                <View
                  style={{
                    width: calcularAnchoGrafico(
                      datosBicicletasComunes.labels.length
                    ),
                  }}
                >
                  {/* Contenedor para capturar el gráfico de bicicletas comunes */}
                  <ViewShot
                    ref={graficoBicicletasComunesRef}
                    options={{ format: "png", quality: 0.9 }}
                  >
                    <BarChart
                      data={datosBicicletasComunes}
                      width={calcularAnchoGrafico(
                        datosBicicletasComunes.labels.length
                      )} // Ancho dinámico basado en etiquetas
                      height={300} // Altura aumentada para acomodar las etiquetas
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff", // Fondo del gráfico
                        backgroundGradientTo: "#ffffff", // Fondo del gráfico
                        decimalPlaces: 0, // Número de decimales
                        color: (opacity = 1) =>
                          `rgba(255, 206, 86, ${opacity})`, // Amarillo para las barras
                        labelColor: (opacity = 1) =>
                          `rgba(0, 0, 0, ${opacity})`, // Color de las etiquetas
                        style: {
                          borderRadius: 16, // Bordes redondeados del gráfico
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "", // Líneas sólidas
                        },
                      }}
                      verticalLabelRotation={45} // Rotación de etiquetas para mejor legibilidad
                      style={[estilos.grafico, { paddingBottom: 30 }]} // Estilos adicionales para el gráfico con padding inferior
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              <View style={estilos.lineaSeparadoraBoton} />
              {/* Botón para Generar Reporte PDF Individual del Gráfico de Bicicletas Comunes */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() =>
                    generarPDFIndividual(
                      graficoBicicletasComunesRef,
                      "Bicicletas_Más_Comunes",
                      datosBicicletasComunes.labels,
                      datosBicicletasComunes.datasets[0].data
                    )
                  }
                  color="#FFCE56" // Color del botón (amarillo)
                />
              </View>
            </View>

            {/* Gráfico de Tipo de Bicicleta */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Tipo de Bicicleta</Text>
              <View style={estilos.lineaSeparadora} />

              {/* ScrollView Horizontal para el Gráfico de Tipo de Bicicleta */}
              <ScrollView horizontal>
                <View
                  style={{
                    width: calcularAnchoGrafico(
                      datosTipoBicicleta.labels.length
                    ),
                  }}
                >
                  {/* Contenedor para capturar el gráfico de tipo de bicicleta */}
                  <ViewShot
                    ref={graficoTipoBicicletaRef}
                    options={{ format: "png", quality: 0.9 }}
                  >
                    <BarChart
                      data={datosTipoBicicleta}
                      width={calcularAnchoGrafico(
                        datosTipoBicicleta.labels.length
                      )} // Ancho dinámico basado en etiquetas
                      height={300} // Altura aumentada para acomodar las etiquetas
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff", // Fondo del gráfico
                        backgroundGradientTo: "#ffffff", // Fondo del gráfico
                        decimalPlaces: 0, // Número de decimales
                        color: (opacity = 1) =>
                          `rgba(153, 102, 255, ${opacity})`, // Púrpura para las barras
                        labelColor: (opacity = 1) =>
                          `rgba(0, 0, 0, ${opacity})`, // Color de las etiquetas
                        style: {
                          borderRadius: 16, // Bordes redondeados del gráfico
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "", // Líneas sólidas
                        },
                      }}
                      verticalLabelRotation={45} // Rotación de etiquetas para mejor legibilidad
                      style={[estilos.grafico, { paddingBottom: 30 }]} // Estilos adicionales para el gráfico con padding inferior
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              <View style={estilos.lineaSeparadoraBoton} />
              {/* Botón para Generar Reporte PDF Individual del Gráfico de Tipo de Bicicleta */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() =>
                    generarPDFIndividual(
                      graficoTipoBicicletaRef, // Referencia al gráfico de tipo de bicicleta
                      "Tipo_de_Bicicleta",
                      datosTipoBicicleta.labels,
                      datosTipoBicicleta.datasets[0].data
                    )
                  }
                  color="#9966FF" // Color del botón (púrpura)
                />
              </View>
            </View>
          </>
        )}
      </View>
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
  reporte: {
    backgroundColor: "#ffffff", // Fondo blanco
    padding: 20, // Espaciado interno de 20 unidades
    borderRadius: 12, // Bordes redondeados con un radio de 12 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    elevation: 4, // Sombra para Android
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.25, // Opacidad de la sombra para iOS
    shadowRadius: 3.84, // Radio de la sombra para iOS
    marginBottom: 25, // Margen inferior de 25 unidades
  },
  subtitulo: {
    fontSize: 20, // Tamaño de fuente de 20 unidades
    fontWeight: "700", // Peso de fuente fuerte
    marginBottom: 10, // Margen inferior de 10 unidades
    color: "#333", // Color del texto gris oscuro
    textAlign: "center", // Alineación del texto al centro
  },
  textoResumen: {
    fontSize: 16, // Tamaño de fuente de 16 unidades
    marginBottom: 5, // Margen inferior de 5 unidades
    color: "#555", // Color del texto gris medio
  },
  graficoContainer: {
    marginBottom: 25, // Margen inferior de 25 unidades para separar los gráficos
    backgroundColor: "#ffffff", // Fondo blanco
    padding: 20, // Espaciado interno de 20 unidades
    borderRadius: 12, // Bordes redondeados con un radio de 12 unidades
    borderWidth: 1, // Grosor del borde de 1 unidad
    borderColor: "#1E90FF", // Color del borde azul claro
    elevation: 4, // Sombra para Android
    shadowColor: "#000", // Color de la sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra para iOS
    shadowOpacity: 0.25, // Opacidad de la sombra para iOS
    shadowRadius: 3.84, // Radio de la sombra para iOS
    overflow: "hidden", // Evita que el contenido se desborde
  },
  graficoTitulo: {
    fontSize: 18, // Tamaño de fuente de 18 unidades
    fontWeight: "700", // Peso de fuente fuerte
    marginBottom: 15, // Margen inferior de 15 unidades
    color: "#333", // Color del texto gris oscuro
    textAlign: "center", // Alineación del texto al centro
  },
  grafico: {
    borderRadius: 16, // Bordes redondeados del gráfico
  },
  botonReporte: {
    marginTop: 15, // Margen superior de 15 unidades
    alignItems: "center", // Centra horizontalmente el botón
  },
  lineaSeparadora: {
    height: 1, // Altura de la línea
    backgroundColor: "#ddd", // Color de la línea gris claro
    marginVertical: 10, // Margen vertical de 10 unidades
  },
  lineaSeparadoraBoton: {
    height: 1, // Altura de la línea
    backgroundColor: "#ddd", // Color de la línea gris claro
    marginVertical: 15, // Margen vertical de 15 unidades
  },
});

export default Reportes;
