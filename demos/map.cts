.map {
  template: http://localhost:8000/demos/widgets.html#map;
  data: .
}

.map .api-key {
  value: apikey;
}

.map table.markers {
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
