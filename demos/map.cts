.map {
  template-proxy: http://localhost:8080/ribbit;
  template: #map;
  data: .
}

.map .api-key {
  value: apikey;
}

.map table.markers tbody {
  repeat: markers;
}

.map table.markers td.title {
  value: title;
}

.map table.markers td.lat {
  value: lat;
}

.map table.markers td.lng {
  value: lng;
}
