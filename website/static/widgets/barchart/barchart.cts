.barchart {
  template: http://www.treesheets.org/widgets/barchart/barchart.html#chart;
  template-proxy: http://people.csail.mit.edu/eob/cts-util/fragment-proxy.php;
  data: .;
  with: barchart;
}

table.series tbody {
  repeat: series;
}

table.series tbody tr {
  repeat: elements;
}

table.series tbody tr td {
  value: .;
}

table.properties {
  with: properties;
}

table.properties td.height {
  value: height;
}

table.properties td.width {
  value: width;
}
