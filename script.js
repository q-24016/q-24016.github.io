"use strict";

const MAP_CONFIG = Object.freeze({
  targetId: "map",
  geoJsonPath: "map.geojson",
  center: [34.840225, 135.705314],
  bounds: {
    southWest: [34.824232, 135.688577],
    northEast: [34.847057, 135.718231]
  },
  zoom: {
    initial: 16,
    min: 15,
    max: 19
  }
});

const STYLE = Object.freeze({
  bikeLane: {
    color: "#2563eb",
    weight: 4,
    opacity: 0.85
  },
  surveyBounds: {
    color: "#f59e0b",
    weight: 2,
    fill: false
  }
});

const DISPLAY_GEOMETRY_TYPES = new Set(["Point", "LineString", "MultiLineString"]);
const HIDDEN_FEATURE_NAMES = new Set(["外周線"]);
const HIDDEN_GEOMETRY_TYPES = new Set(["Polygon", "MultiPolygon"]);

const redPinIcon = L.divIcon({
  className: "red-pin-icon",
  html: '<div class="red-pin-shape" aria-hidden="true"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

initializeMap();

function initializeMap() {
  const bounds = createBounds(MAP_CONFIG.bounds);
  const map = createMap(bounds);

  addBaseTileLayer(map);
  addSurveyBounds(map, bounds);
  loadSurveyData(map);
}

function createBounds(boundsConfig) {
  return L.latLngBounds(boundsConfig.southWest, boundsConfig.northEast);
}

function createMap(bounds) {
  return L.map(MAP_CONFIG.targetId, {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom.initial,
    minZoom: MAP_CONFIG.zoom.min,
    maxZoom: MAP_CONFIG.zoom.max,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  });
}

function addBaseTileLayer(map) {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: MAP_CONFIG.zoom.max,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function addSurveyBounds(map, bounds) {
  L.rectangle(bounds, STYLE.surveyBounds).addTo(map);
}

async function loadSurveyData(map) {
  const statusElement = document.getElementById("mapStatus");

  try {
    const geoJson = await fetchGeoJson(MAP_CONFIG.geoJsonPath);
    const normalizedGeoJson = normalizeGeoJson(geoJson);

    L.geoJSON(normalizedGeoJson, {
      filter: shouldDisplayFeature,
      style: getFeatureStyle,
      pointToLayer: createPointMarker,
      onEachFeature: bindPopup
    }).addTo(map);

    hideStatus(statusElement);
  } catch (error) {
    console.error(error);
    showStatus(statusElement, "地図データを読み込めませんでした。ファイル名や配置場所を確認してください。");
  }
}

async function fetchGeoJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`GeoJSONの読み込みに失敗しました: ${response.status}`);
  }

  return response.json();
}

function normalizeGeoJson(geoJson) {
  return {
    ...geoJson,
    features: geoJson.features.map((feature) => ({
      ...feature,
      geometry: normalizeGeometry(feature.geometry)
    }))
  };
}

function normalizeGeometry(geometry) {
  if (!geometry || !geometry.coordinates) {
    return geometry;
  }

  return {
    ...geometry,
    coordinates: normalizeCoordinates(geometry.coordinates)
  };
}

function normalizeCoordinates(coordinates) {
  if (isCoordinatePair(coordinates)) {
    const [longitude, latitude] = coordinates;
    return [normalizeLongitude(longitude), latitude];
  }

  return coordinates.map(normalizeCoordinates);
}

function isCoordinatePair(value) {
  return Array.isArray(value) && typeof value[0] === "number" && typeof value[1] === "number";
}

function normalizeLongitude(longitude) {
  return longitude < -180 ? longitude + 360 : longitude;
}

function shouldDisplayFeature(feature) {
  const type = feature.geometry?.type;
  const name = feature.properties?.name ?? "";

  if (HIDDEN_GEOMETRY_TYPES.has(type) || HIDDEN_FEATURE_NAMES.has(name)) {
    return false;
  }

  if (!feature.properties?._umap_options) {
    return false;
  }

  return DISPLAY_GEOMETRY_TYPES.has(type);
}

function getFeatureStyle(feature) {
  const type = feature.geometry?.type;

  if (type === "LineString" || type === "MultiLineString") {
    return STYLE.bikeLane;
  }

  return undefined;
}

function createPointMarker(_feature, latLng) {
  return L.marker(latLng, { icon: redPinIcon });
}

function bindPopup(feature, layer) {
  const name = feature.properties?.name ?? "";
  const description = feature.properties?.description ?? "";

  if (!name && !description) {
    return;
  }

  layer.bindPopup(createPopupHtml(name, description));
}

function createPopupHtml(name, description) {
  const escapedName = escapeHtml(name);
  const escapedDescription = escapeHtml(description);

  if (escapedName && escapedDescription) {
    return `<strong>${escapedName}</strong><br>${escapedDescription}`;
  }

  return escapedName || escapedDescription;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hideStatus(element) {
  if (element) {
    element.classList.add("is-hidden");
  }
}

function showStatus(element, message) {
  if (element) {
    element.textContent = message;
    element.classList.remove("is-hidden");
  }
}
