// screens/Reportes.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  Dimensions,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
import { db } from '../DataBase/Configuraciones';
import { collection, onSnapshot } from 'firebase/firestore';
import ViewShot from 'react-native-view-shot';
import jsPDF from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get('window').width - 40; // Ajuste para márgenes

const Reportes = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para resumen del día
  const [totalReparaciones, setTotalReparaciones] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [completadasHoy, setCompletadasHoy] = useState(0);

  // Referencias para capturar los gráficos
  const lineChartRef = useRef();
  const barChartRef = useRef();
  const pieChartRef = useRef();
  const bicicletasComunesRef = useRef();
  const tipoBicicletaRef = useRef();

  // Estados para almacenar datos de los gráficos
  const [dataLine, setDataLine] = useState({});
  const [dataBar, setDataBar] = useState({});
  const [dataPie, setDataPie] = useState([]);
  const [dataBicicletasComunes, setDataBicicletasComunes] = useState({});
  const [dataTipoBicicleta, setDataTipoBicicleta] = useState({});

  useEffect(() => {
    const reparacionesRefDB = collection(db, 'reparaciones');
    const unsubscribe = onSnapshot(
      reparacionesRefDB,
      (querySnapshot) => {
        const reparacionesData = [];
        querySnapshot.forEach((doc) => {
          reparacionesData.push({ id: doc.id, ...doc.data() });
        });
        setReparaciones(reparacionesData);
        procesarDatos(reparacionesData);
        setCargando(false);
      },
      (error) => {
        console.error('Error al obtener reparaciones:', error);
        Alert.alert('Error', 'Hubo un problema al obtener las reparaciones.');
        setCargando(false);
      }
    );

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  // Función para procesar datos y preparar los gráficos
  const procesarDatos = (datos) => {
    // Resumen del Día
    const total = datos.length;
    const pendientesCount = datos.filter(r => r.gestionOrden.estado === 'Pendiente').length;
    const completadasHoyCount = datos.filter(r => 
      r.gestionOrden.estado === 'Completado' &&
      r.programacion.fechaEntrega === new Date().toISOString().split('T')[0]
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
      const fechaStr = fecha.toISOString().split('T')[0];
      dias.push(fechaStr.slice(5)); // MM-DD
      const count = datos.filter(r => 
        r.gestionOrden.estado === 'Completado' &&
        r.programacion.fechaEntrega === fechaStr
      ).length;
      reparacionesPorDia.push(count);
    }

    setDataLine({
      labels: dias,
      datasets: [
        {
          data: reparacionesPorDia,
          strokeWidth: 2,
          color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`, // Azul Dodger
        },
      ],
      legend: ['Reparaciones Completadas'],
    });

    // Gráfico de Barras: Reparaciones por tipo de servicio
    const tiposServicio = {};
    datos.forEach(r => {
      const tipo = r.detallesReparacion.tipoServicio;
      if (tiposServicio[tipo]) {
        tiposServicio[tipo] += 1;
      } else {
        tiposServicio[tipo] = 1;
      }
    });

    setDataBar({
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

    const pieData = Object.keys(estados).map((estado, index) => ({
      name: estado,
      population: estados[estado],
      color: coloresPie[index % coloresPie.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

    setDataPie(pieData);

    // Gráfico de Barras: Bicicletas Más Comunes
    const bicicletasComunes = {};
    datos.forEach(r => {
      const marcaModelo = `${r.bicicleta.marca} ${r.bicicleta.modelo}`;
      if (bicicletasComunes[marcaModelo]) {
        bicicletasComunes[marcaModelo] += 1;
      } else {
        bicicletasComunes[marcaModelo] = 1;
      }
    });

    // Ordenar de mayor a menor y tomar las top 10
    const sortedBicicletas = Object.entries(bicicletasComunes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const labelsBicicletas = sortedBicicletas.map(item => item[0]);
    const dataBicicletas = sortedBicicletas.map(item => item[1]);

    setDataBicicletasComunes({
      labels: labelsBicicletas,
      datasets: [
        {
          data: dataBicicletas,
        },
      ],
    });

    // Gráfico de Barras: Tipo de Bicicleta
    const tiposBicicleta = {};
    datos.forEach(r => {
      const tipo = r.bicicleta.tipo;
      if (tiposBicicleta[tipo]) {
        tiposBicicleta[tipo] += 1;
      } else {
        tiposBicicleta[tipo] = 1;
      }
    });

    setDataTipoBicicleta({
      labels: Object.keys(tiposBicicleta),
      datasets: [
        {
          data: Object.values(tiposBicicleta),
        },
      ],
    });
  };

  // Colores para el gráfico de pastel
  const coloresPie = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  // Función para generar y compartir el PDF individual
  const generarPDFIndividual = async (ref, titulo, labels, data) => {
    try {
      // Capturar el gráfico
      const chartURI = await ref.current.capture();

      // Convertir imagen a base64
      const chartBase64 = await FileSystem.readAsStringAsync(chartURI, { encoding: FileSystem.EncodingType.Base64 });

      // Crear el documento PDF
      const doc = new jsPDF();

      // Agregar Título
      doc.setFontSize(22);
      doc.text(titulo.replace(/_/g, ' '), 105, 20, null, null, 'center');

      // Agregar Imagen del Gráfico
      doc.addImage(`data:image/png;base64,${chartBase64}`, 'PNG', 15, 30, 180, 100); // Ajustar dimensiones según necesidad

      // Agregar Datos Asociados
      doc.setFontSize(16);
      doc.text('Datos del Gráfico:', 15, 140);
      doc.setFontSize(12);
      const startY = 150;
      const lineHeight = 10;
      labels.forEach((label, index) => {
        const text = `${label}: ${data[index]}`;
        const currentY = startY + index * lineHeight;
        // Manejar el salto de página si es necesario
        if (currentY > 270) { // Ajustar según el tamaño de la página
          doc.addPage();
          doc.text('Datos del Gráfico (Continuación):', 15, 20);
          doc.text(text, 15, 30 + (index - Math.floor(currentY / 270)) * lineHeight);
        } else {
          doc.text(text, 15, currentY);
        }
      });

      // Guardar el PDF en el sistema de archivos
      const pdfURI = FileSystem.cacheDirectory + `${titulo.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      await FileSystem.writeAsStringAsync(pdfURI, doc.output('datauristring').split(',')[1], { encoding: FileSystem.EncodingType.Base64 });

      // Compartir el PDF
      await Sharing.shareAsync(pdfURI, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartir ${titulo.replace(/_/g, ' ')}`,
        UTI: 'com.adobe.pdf',
      });

    } catch (error) {
      console.error(`Error al generar el PDF para ${titulo}:`, error);
      Alert.alert('Error', `Hubo un problema al generar el reporte para ${titulo.replace(/_/g, ' ')}.`);
    }
  };

  // Función para calcular el ancho dinámico del gráfico basado en la cantidad de etiquetas
  const calcularAnchoGrafico = (numeroEtiquetas) => {
    const anchoPorEtiqueta = 60; // Ancho por cada etiqueta en píxeles
    const anchoMinimo = screenWidth;
    const anchoTotal = numeroEtiquetas * anchoPorEtiqueta;
    return anchoTotal > anchoMinimo ? anchoTotal : anchoMinimo;
  };

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Contenido */}
      <View style={estilos.contenido}>
        {cargando ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <>
            {/* Resumen del Día */}
            <View style={estilos.reporte}>
              <Text style={estilos.subtitulo}>Resumen del Día</Text>
              <Text>Total de reparaciones: {totalReparaciones}</Text>
              <Text>Pendientes: {pendientes}</Text>
              <Text>Completadas hoy: {completadasHoy}</Text>
            </View>

            {/* Gráfico de Línea */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Reparaciones Completadas por Día (Últimos 7 Días)</Text>
              <ScrollView horizontal>
                <View style={{ width: calcularAnchoGrafico(dataLine.labels.length) }}>
                  <ViewShot ref={lineChartRef} options={{ format: 'png', quality: 0.9 }}>
                    <LineChart
                      data={dataLine}
                      width={calcularAnchoGrafico(dataLine.labels.length)} // Ancho dinámico
                      height={220}
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: "4",
                          strokeWidth: "2",
                          stroke: "#1E90FF",
                        },
                      }}
                      bezier
                      style={estilos.grafico}
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              {/* Botón para Generar Reporte PDF Individual */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() => generarPDFIndividual(
                    lineChartRef,
                    'Reparaciones_Completadas_por_Día',
                    dataLine.labels,
                    dataLine.datasets[0].data
                  )}
                  color="#1E90FF"
                />
              </View>
            </View>

            {/* Gráfico de Barras */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Reparaciones por Tipo de Servicio</Text>
              <ScrollView horizontal>
                <View style={{ width: calcularAnchoGrafico(dataBar.labels.length) }}>
                  <ViewShot ref={barChartRef} options={{ format: 'png', quality: 0.9 }}>
                    <BarChart
                      data={dataBar}
                      width={calcularAnchoGrafico(dataBar.labels.length)} // Ancho dinámico
                      height={220}
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "",
                        },
                      }}
                      verticalLabelRotation={30}
                      style={estilos.grafico}
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              {/* Botón para Generar Reporte PDF Individual */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() => generarPDFIndividual(
                    barChartRef,
                    'Reparaciones_por_Tipo_de_Servicio',
                    dataBar.labels,
                    dataBar.datasets[0].data
                  )}
                  color="#1E90FF"
                />
              </View>
            </View>

            {/* Gráfico de Pastel */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Distribución de Estados</Text>
              <ScrollView horizontal>
                <View style={{ width: calcularAnchoGrafico(dataPie.length) }}>
                  <ViewShot ref={pieChartRef} options={{ format: 'png', quality: 0.9 }}>
                    <PieChart
                      data={dataPie}
                      width={calcularAnchoGrafico(dataPie.length)} // Ancho dinámico
                      height={220}
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
              {/* Botón para Generar Reporte PDF Individual */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() => {
                    // Preparar los datos para el gráfico de pastel
                    const labels = dataPie.map(item => item.name);
                    const values = dataPie.map(item => item.population);
                    generarPDFIndividual(
                      pieChartRef,
                      'Distribución_de_Estados',
                      labels,
                      values
                    );
                  }}
                  color="#1E90FF"
                />
              </View>
            </View>

            {/* Gráfico de Bicicletas Más Comunes */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Bicicletas Más Comunes</Text>
              <ScrollView horizontal>
                <View style={{ width: calcularAnchoGrafico(dataBicicletasComunes.labels.length) }}>
                  <ViewShot ref={bicicletasComunesRef} options={{ format: 'png', quality: 0.9 }}>
                    <BarChart
                      data={dataBicicletasComunes}
                      width={calcularAnchoGrafico(dataBicicletasComunes.labels.length)} // Ancho dinámico
                      height={220}
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "",
                        },
                      }}
                      verticalLabelRotation={30}
                      style={estilos.grafico}
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              {/* Botón para Generar Reporte PDF Individual */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() => generarPDFIndividual(
                    bicicletasComunesRef,
                    'Bicicletas_Más_Comunes',
                    dataBicicletasComunes.labels,
                    dataBicicletasComunes.datasets[0].data
                  )}
                  color="#1E90FF"
                />
              </View>
            </View>

            {/* Gráfico de Tipo de Bicicleta */}
            <View style={estilos.graficoContainer}>
              <Text style={estilos.graficoTitulo}>Tipo de Bicicleta</Text>
              <ScrollView horizontal>
                <View style={{ width: calcularAnchoGrafico(dataTipoBicicleta.labels.length) }}>
                  <ViewShot ref={tipoBicicletaRef} options={{ format: 'png', quality: 0.9 }}>
                    <BarChart
                      data={dataTipoBicicleta}
                      width={calcularAnchoGrafico(dataTipoBicicleta.labels.length)} // Ancho dinámico
                      height={220}
                      chartConfig={{
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "",
                        },
                      }}
                      verticalLabelRotation={30}
                      style={estilos.grafico}
                    />
                  </ViewShot>
                </View>
              </ScrollView>
              {/* Botón para Generar Reporte PDF Individual */}
              <View style={estilos.botonReporte}>
                <Button
                  title="Generar Reporte PDF"
                  onPress={() => generarPDFIndividual(
                    tipoBicicletaRef,
                    'Tipo_de_Bicicleta',
                    dataTipoBicicleta.labels,
                    dataTipoBicicleta.datasets[0].data
                  )}
                  color="#1E90FF"
                />
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// Función para calcular el ancho dinámico del gráfico basado en la cantidad de etiquetas
const calcularAnchoGrafico = (numeroEtiquetas) => {
  const anchoPorEtiqueta = 60; // Ancho por cada etiqueta en píxeles
  const anchoMinimo = Dimensions.get('window').width - 40; // Mantener margen
  const anchoTotal = numeroEtiquetas * anchoPorEtiqueta;
  return anchoTotal > anchoMinimo ? anchoTotal : anchoMinimo;
};

// Configuración del gráfico
const configChart = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0, // Número de decimales
  color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`, // Azul Dodger
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Negro para etiquetas
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#1E90FF",
  },
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contenido: {
    padding: 20,
  },
  reporte: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    elevation: 2,
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  graficoContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E90FF',
    elevation: 2,
  },
  graficoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  grafico: {
    borderRadius: 16,
  },
  botonReporte: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
});

export default Reportes;
