function builderESDS() {

  var builderESDS = {};

  builderESDS.version = "0.0.1";

  builderESDS.metrics = [];
  builderESDS.buckets = [];

  builderESDS.metricId = 0;
  builderESDS.bucketId = 0;


  ////////////////////////////////UNIR METRICAS Y BUCKETS EN LA ESTRUCTURA DE DATOS/////////////////////////////////////
  builderESDS.buildDataStructure = function () {

    builderESDS.dataStucture = builderESDS.buckets.concat(builderESDS.metrics);

    console.log("Estructura de datos", builderESDS.dataStucture)

    return builderESDS;
  }

  builderESDS.getDataStructure = function () {
    return builderESDS.dataStucture;
  }
  ////////////////////////////////////////////////////////////////////////

  /////////////////////////////AÑADIR METRICAS Y BUCKETS////////////
  builderESDS.addMetric = function (aggType, field, options) {
    var agg = {
      id: builderESDS.metricId,
      type: "metric",
      aggregationType: aggType,
      aggregationField: field,
      aggregationOptions: options
    };
    builderESDS.metricId++;
    builderESDS.metrics.push(agg)

    return builderESDS;
  }

  builderESDS.addBucket = function (aggType, field, options) {
    var agg = {
      id: builderESDS.bucketId,
      type: "bucket",
      aggregationType: aggType,
      aggregationField: field,
      aggregationOptions: options
    };
    builderESDS.bucketId++;
    builderESDS.buckets.push(agg)

    return builderESDS;
  }
  ////////////////////////////////////////////////////////////////////////

  builderESDS.reset = function () {
    builderESDS.metrics = [];
    builderESDS.buckets = [];

    builderESDS.metricId = 0;
    builderESDS.bucketId = 0;

    return builderESDS;
  }


  return builderESDS;
}
