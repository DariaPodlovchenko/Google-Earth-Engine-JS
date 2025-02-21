// Définir la zone d'intérêt sous forme de géométrie (point avec un buffer de 20 km)
var elbrus = ee.Geometry.Point(42.4511, 43.3504).buffer(20000);

// Définir la période de temps (août 1999)
var startDate = '1999-08-01';
var endDate = '1999-08-31';

// Filtrer la collection d'images Landsat 7 par zone d'intérêt et date
var landsat7 = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
  .filterBounds(elbrus)
  .filterDate(startDate, endDate);

// Trier les images par couverture nuageuse (sélection de l'image avec le moins de nuages)
var sorted = landsat7.sort('CLOUD_COVER');

// Sélectionner la première image (la moins nuageuse)
var firstImage = ee.Image(sorted.first());

// Générer une image RVB à partir des bandes B3 (rouge), B2 (vert), B1 (bleu)
var rgbImage = firstImage.select(['B3', 'B2', 'B1']);

// Correction du contraste pour l'image RVB
var enhancedImage = rgbImage.visualize({min: 0, max: 3000, gamma: 1.3});

// Ajouter l'image améliorée à la carte
Map.addLayer(enhancedImage, {}, 'Enhanced Landsat 7 Image');

// Calculer l'indice NDSI (Normalized Difference Snow Index)
var ndsi = firstImage.normalizedDifference(['B2', 'B5']);

// Définir les paramètres de visualisation pour le NDSI
var ndsiParams = {min: 0, max: 1, palette: ['blue', 'white']};

// Ajouter l'image NDSI à la carte
Map.addLayer(ndsi, ndsiParams, 'NDSI Landsat 7');

// Centrer la carte sur la zone d'intérêt avec un niveau de zoom de 10
Map.centerObject(elbrus, 10);

// Exporter l'image RVB améliorée vers Google Drive
Export.image.toDrive({
  image: enhancedImage,
  description: 'landsat7_enhanced_image',
  scale: 30,
  region: elbrus
});

// Exporter l'image NDSI vers Google Drive
Export.image.toDrive({
  image: ndsi,
  description: 'landsat7_ndsi',
  scale: 30,
  region: elbrus
});
