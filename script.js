// 表示・移動を許可する範囲
const bounds = L.latLngBounds(
  [34.824232, 135.688577],
  [34.847057, 135.718231]
);

// 地図を作成
const map = L.map("map", {
  center: [34.840225, 135.705314],
  zoom: 16,
  minZoom: 15,
  maxZoom: 19,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0
});

// OpenStreetMapの地図タイルを表示
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 調査範囲を確認用に表示
L.rectangle(bounds, {
  color: "orange",
  weight: 2,
  fill: false
}).addTo(map);

// 赤いまちばり型マーカー
const redPinIcon = L.divIcon({
  className: "red-pin-icon",
  html: '<div class="red-pin-shape"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

// 経度 -224.xxx を 135.xxx に修正する関数
function fixLongitude(coords) {
  if (typeof coords[0] === "number") {
    let lng = coords[0];
    const lat = coords[1];

    if (lng < -180) {
      lng = lng + 360;
    }

    return [lng, lat];
  }

  return coords.map(fixLongitude);
}

// GeoJSONを読み込む
fetch("map.geojson")
  .then(response => response.json())
  .then(data => {
    data.features.forEach(feature => {
      feature.geometry.coordinates = fixLongitude(feature.geometry.coordinates);
    });

    L.geoJSON(data, {
      filter: function(feature) {
        const type = feature.geometry.type;
        const name = feature.properties.name || "";

        // マスクエリアは非表示
        if (type === "Polygon") {
          return false;
        }

        // 外周線は非表示
        if (name === "外周線") {
          return false;
        }

        // uMapで作った点・線だけ表示
        if (!feature.properties._umap_options) {
          return false;
        }

        return (
          type === "Point" ||
          type === "LineString" ||
          type === "MultiLineString"
        );
      },

      // 線データ：自転車通行可能歩道
      style: function(feature) {
        const type = feature.geometry.type;

        if (type === "LineString" || type === "MultiLineString") {
          return {
            color: "blue",
            weight: 4,
            opacity: 0.8
          };
        }
      },

      // 点データ：一時停止
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: redPinIcon
        });
      },

      // クリック時のポップアップ
      onEachFeature: function(feature, layer) {
        const name = feature.properties.name || "";
        const description = feature.properties.description || "";

        if (name || description) {
          layer.bindPopup(`
            <strong>${name}</strong><br>
            ${description}
          `);
        }
      }
    }).addTo(map);
  });