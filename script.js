// 表示・移動を許可する範囲
// 左下 [緯度, 経度]、右上 [緯度, 経度]
const bounds = L.latLngBounds(
  [34.824232,-224.311423],
  [34.847057,-224.281769]
);

// 地図を作成
const map = L.map("map", {
  center: [34.840225,-224.294686],
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