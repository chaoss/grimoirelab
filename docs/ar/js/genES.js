function genES() {
  var genEs = {};
  genES.version = "0.0.1";

  ///////////////////////////////Get indices//////////////////////////////////////
  genES.getIndicesNames = function (client) {
    client.cat.indices({
      h: ['index', 'doc_count']
    }).then(function (body) {
      let lines = body.split('\n');
      let indices = lines.map(function (line) {
        let row = line.split(' ');
        return { name: row[0], count: row[1] };
      });
      indices.pop();
      return indices;
    }, function (err) {
      return "ERROR"
      console.trace(err.message);
    });
  }
  ////////////////////////////////////////////////////////////////////////////

  //Monta el objeto bodybuilder
  genES.buildBodybuilderObject = function (statements, bodybuilder) {
    var index = 0;
    if (statements.length > 1) {
      var bodyQuery = bodybuilder().aggregation(statements[index].aggregationType, statements[index].aggregationField, statements[index].aggregationOptions, (agg) => {
        var nestedAgg;
        function makeNestedAgg(aggBuilder) {
          index++;
          if (!statements[index]) return nestedAgg;
          var type = statements[index].type;

          //Si es metric no hay que hacer un nestedAgg, ahora son todas agregaciones en paralelo
          if (type == "metric") {
            //Ahora las metricas
            for (var i = index; i < statements.length; i++) {
              //No meto las de count
              if (statements[i].aggregationType != "count") {
                aggBuilder.aggregation(statements[i].aggregationType, statements[i].aggregationField, statements[i].aggregationOptions);
              }
            }
            return aggBuilder;
          }

          var aggtype = statements[index].aggregationType;
          var field = statements[index].aggregationField;
          var options = statements[index].aggregationOptions;
          //index++;
          return aggBuilder.aggregation(aggtype, field, options, (agg) => makeNestedAgg(nestedAgg = agg));
        }
        return makeNestedAgg(agg);
      })
    } else {
      //Solo una agregación
      var bodyQuery = bodybuilder().aggregation(statements[0].aggregationType, statements[0].aggregationField, statements[0].aggregationOptions);
    }
    genES.objBB = bodyQuery;
    return genES;
  }
  //Devuelve el objeto bodybuilder
  genES.getBodybuilderObject = function () {
    return genES.objBB;
  }


  //Monta la query
  genES.buildQuery = function () {
    genES.query = genES.objBB.build()
    console.log(genES.query)
    return genES;
  }
  //Devuelve la query montada
  genES.getQuery = function () {
    return genES.query;
  }


  //Este metodo devuelve una promesa por que esta haciendo una búsqueda externa
  genES.executeSearch = function (client, indexName, typeName) {
    var promise = client.search({
      index: indexName,
      type: typeName,
      size: 5,
      body: genES.query
    })
    return promise
  }

  // Check if .vboard index exists
  genES.checkVBoardIndex = function (client) {
    return client.indices.getMapping({
      index: ".vboard"
    })
  }

  // Create index of .vboard
  genES.createVBoardIndex = function (client) {
    return client.indices.create({
      index: ".vboard",
      body: {
        "settings": {
          "number_of_shards": 1
        },
        "mappings": {
          "visthreed": {
            "properties": {
              "chartType": { "type": "text" },
              "name": { "type": "text" },
              "description": { "type": "text" },
              "indexOfES": { "type": "text" },
              "typeOfES": { "type": "text" },
              "metricsSelected": { "type": "object" },
              "bucketsSelected": { "type": "object" },
              "data": { "type": "object" }
            }
          },
          "panelthreed": {
            "properties": {
              "position": { "type": "text" },
              "rows": { "type": "text" },
              "columns": { "type": "text" },
              "dimension": { "type": "text" },
              "opacity": { "type": "text" },
              "charts": { "type": "object" },
              "name": { "type": "text" },
              "description": { "type": "text" }
            }
          },
          "dashthreed": {
            "properties": {
              "background": { "type": "text" },
              "panels": { "type": "object" },
              "charts": { "type": "object" },
              "name": { "type": "text" },
              "description": { "type": "text" }
            }
          }
        }
      }
    })
  }

  //Cargar todas las visualizaciones
  genES.loadAllVis = function (client) {

    var promise = client.search({
      index: ".vboard",
      type: 'visthreed',
      size: 10000,
      body: { "query": { "match_all": {} } }
    });

    return promise;
  }

  //Cargar todos los paneles
  genES.loadAllPanels = function (client) {

    var promise = client.search({
      index: ".vboard",
      type: 'panelthreed',
      size: 10000,
      body: { "query": { "match_all": {} } }
    });

    return promise;
  }

  //Cargar todos los dashboards
  genES.loadAllDashboards = function (client) {

    var promise = client.search({
      index: ".vboard",
      type: 'dashthreed',
      size: 10000,
      body: { "query": { "match_all": {} } }
    });

    return promise;
  }

  //COMPROBAR VISUALIZACIÓN EN ES
  genES.checkVis = function (client, nameP, descriptionP, vistype) {

    var promise = client.search({
      index: '.vboard',
      type: 'visthreed',
      size: 5,
      body: {
        "query": {
          "terms": {
            "_id": [vistype + "_" + nameP]
          }
        }
      }
    })

    return promise;
  }

  //COMPROBAR PANEL EN ES
  genES.checkPanel = function (client, nameP) {

    var promise = client.search({
      index: '.vboard',
      type: 'panelthreed',
      size: 5,
      body: {
        "query": {
          "terms": {
            "_id": [nameP]
          }
        }
      }
    })

    return promise;
  }

  //COMPROBAR PANEL EN ES
  genES.checkDashboard = function (client, nameP) {

    var promise = client.search({
      index: '.vboard',
      type: 'dashthreed',
      size: 5,
      body: {
        "query": {
          "terms": {
            "_id": [nameP]
          }
        }
      }
    })

    return promise;
  }

  //Cargar Visualizacion
  genES.getVis = function (client, idtosearch) {

    var promise = client.search({
      index: '.vboard',
      type: 'visthreed',
      size: 5,
      body: {
        "query": {
          "terms": {
            "_id": [idtosearch]
          }
        }
      }
    })

    return promise;
  }

  //Cargar Panel
  genES.getPanel = function (client, idtosearch) {

    var promise = client.search({
      index: '.vboard',
      type: 'panelthreed',
      size: 5,
      body: {
        "query": {
          "terms": {
            "_id": [idtosearch]
          }
        }
      }
    })

    return promise;
  }

  //Cargar Dashboard
  genES.getDash = function (client, idtosearch) {

    var promise = client.search({
      index: '.vboard',
      type: 'dashthreed',
      size: 5,
      body: {
        "query": {
          "terms": {
            "_id": [idtosearch]
          }
        }
      }
    })

    return promise;
  }

  //Actualizar VISUALIZACIÓN ES
  genES.updateVis = function (client, nameP, descriptionP, vistype, dataP, index, type, metrics, buckets) {

    var promise = client.update({
      index: '.vboard',
      type: 'visthreed',
      id: vistype + "_" + nameP,
      body: {
        doc: {
          chartType: vistype,
          description: descriptionP,
          name: nameP,
          data: dataP,
          indexOfES: index,
          typeOfES: type,
          metricsSelected: metrics,
          bucketsSelected: buckets,
        }
      }
    });
    return promise;
  }

  //Actualizar PANEL ES
  genES.updatePanel = function (client, nameP, descriptionP, positionP, rowsP, columnsP, dim, op, chartsP) {

    var promise = client.update({
      index: '.vboard',
      type: 'panelthreed',
      id: nameP,
      body: {
        doc: {
          description: descriptionP,
          name: nameP,
          position: positionP,
          rows: rowsP,
          columns: columnsP,
          dimension: dim,
          opacity: op,
          charts: chartsP,
        }
      }
    });
    return promise;
  }

  //Actualizar DASHBOARD ES
  genES.updateDashboard = function (client, nameP, descriptionP, chartsP, panelsP, backgroundP) {

    var promise = client.update({
      index: '.vboard',
      type: 'dashthreed',
      id: nameP,
      body: {
        doc: {
          background: backgroundP,
          description: descriptionP,
          name: nameP,
          charts: chartsP,
          panels: panelsP,
        }
      }
    });
    return promise;
  }

  //CREAR VISUALIZACIÓN ES
  genES.createVis = function (client, nameP, descriptionP, vistype, dataP, index, type, metrics, buckets) {

    var promise = client.create({
      index: '.vboard',
      type: 'visthreed',
      id: vistype + "_" + nameP,
      body: {
        chartType: vistype,
        description: descriptionP,
        name: nameP,
        data: dataP,
        indexOfES: index,
        typeOfES: type,
        metricsSelected: metrics,
        bucketsSelected: buckets,
      }
    });// function (error, response) {
    //console.log(error, response, "OK")
    //});
    return promise;
  }

  //CREAR PANEL ES
  genES.createPanel = function (client, nameP, descriptionP, positionP, rowsP, columnsP, dim, op, chartsP) {

    var promise = client.create({
      index: '.vboard',
      type: 'panelthreed',
      id: nameP,
      body: {
        description: descriptionP,
        name: nameP,
        position: positionP,
        rows: rowsP,
        columns: columnsP,
        dimension: dim,
        opacity: op,
        charts: chartsP,
      }
    });

    return promise;
  }

  //CREAR DASHBOARD ES
  genES.createDashboard = function (client, nameP, descriptionP, chartsP, panelsP, backgroundP) {

    var promise = client.create({
      index: '.vboard',
      type: 'dashthreed',
      id: nameP,
      body: {
        background: backgroundP,
        description: descriptionP,
        name: nameP,
        charts: chartsP,
        panels: panelsP,
      }
    });

    return promise;
  }

  return genES;
}
