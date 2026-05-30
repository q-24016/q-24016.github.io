// 表示・移動を許可する範囲
// 左下 [緯度, 経度]、右上 [緯度, 経度]
const bounds = L.latLngBounds(
  [34.825, 135.675],
  [34.850, 135.725]
);

// 地図を作成
const map = L.map("map", {
  center: [34.836777, 135.699426],
  zoom: 16,
  minZoom: 15,
  maxZoom: 19,

  // 移動できる範囲を制限
  maxBounds: bounds,
  maxBoundsViscosity: 1.0
});

// OpenStreetMapの地図タイルを表示
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 調査範囲を確認用に表示
// 完成版で不要なら、この3行は消してOK
L.rectangle(bounds, {
  color: "orange",
  weight: 2,
  fill: false
}).addTo(map);

// uMapから出力したGeoJSONを読み込む
fetch("map.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      // 線データの見た目
      style: function(feature) {
        const type = feature.geometry.type;

        if (type === "LineString" || type === "MultiLineString") {
          return {
            color: "blue",
            weight: 5
          };
        }
      },

      // 点データの見た目
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          color: "red",
          fillColor: "red",
          fillOpacity: 0.9
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