.map {
  template: http://www.treesheets.org/widgets/google-map/google-map.html#map;
  template-proxy: http://people.csail.mit.edu/eob/cts-util/fragment-proxy.php;
  data: .;
  with: map;
}

.map .properties {
  with: properties;
}

.map .properties .width {
  value: width;
}

.map .properties .height {
  value: height;
}

.map .properties .zoom-level {
  value: zoomLevel;
}

.map .properties .center-lat {
  value: centerLat;
}

.map .properties .center-lng {
  value: centerLng;
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

.map table.markers td.image {
  value: image;
}

.map table.markers td.description{
  value: description;
}

.map table.markers td.description-maxwidth {
  value: description-maxwidth;
}

.map table.markers td.lng {
  value: lng;
}
