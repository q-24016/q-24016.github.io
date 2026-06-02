# 大阪工業大学周辺調査マップ リファクタリング版

## ファイル構成

- `index.html`: 画面構造
- `style.css`: 見た目とレスポンシブ対応
- `script.js`: Leafletの初期化、GeoJSON読み込み、表示制御
- `map.geojson`: 地図データ

## 主な改善点

1. HTML / CSS / JavaScript の責務を整理
2. JavaScriptを関数分割し、設定値を `MAP_CONFIG` に集約
3. GeoJSON読み込み失敗時に画面上へメッセージを表示
4. ポップアップ文字列をエスケープし、HTML混入に強くした
5. 凡例をリスト化し、スマホ表示でも崩れにくくした
6. 経度が `-224.xxx` になっているデータも自動補正できるようにした

## 使い方

4つのファイルを同じフォルダに置いてください。

```text
index.html
style.css
script.js
map.geojson
```

VS Code の Live Server など、ローカルサーバー経由で `index.html` を開くと動作確認できます。
ブラウザで直接 `index.html` を開くと、環境によっては `fetch("map.geojson")` が制限される場合があります。
