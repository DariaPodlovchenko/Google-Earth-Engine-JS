// Définir la zone d'intérêt sous forme de géométrie (point avec un buffer de 20 km)
var elbrus = ee.Geometry.Point(42.4511, 43.3504).buffer(20000);

// Définir la période de temps (août 2021)
var startDate = '2021-08-01';
var endDate = '2021-08-31';

// Filtrer la collection d'images Landsat 8 par zone d'intérêt et date
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterBounds(elbrus)
  .filterDate(startDate, endDate);

// Trier les images par couverture nuageuse (sélection de l'image avec le moins de nuages)
var sorted = landsat8.sort('CLOUD_COVER');

// Sélectionner la première image (la moins nuageuse)
var firstImage = ee.Image(sorted.first());

// Générer une image RVB à partir des bandes B4 (rouge), B3 (vert), B2 (bleu)
var rgbImage = firstImage.select(['B4', 'B3', 'B2']);

// Ajouter l'image RVB à la carte
Map.addLayer(rgbImage, {max: 3000}, 'RGB Image');

// Calculer l'indice NDSI (Normalized Difference Snow Index)
var ndsi = firstImage.normalizedDifference(['B3', 'B6']);

// Définir les paramètres de visualisation pour le NDSI
var ndsiParams = {min: 0, max: 1, palette: ['blue', 'white']};

// Ajouter l'image NDSI à la carte
Map.addLayer(ndsi, ndsiParams, 'NDSI Landsat 8');

// Centrer la carte sur la zone d'intérêt avec un niveau de zoom de 14
Map.centerObject(elbrus, 14);

// Exporter l'image RVB traitée vers Google Drive
Export.image.toDrive({
  image: rgbImage,
  description: 'landsat8_rgb_image',
  scale: 30,
  region: elbrus
});

// Exporter l'image NDSI vers Google Drive
Export.image.toDrive({
  image: ndsi,
  description: 'landsat8_ndsi',
  scale: 30,
  region: elbrus
});
