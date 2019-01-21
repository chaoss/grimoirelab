$( document ).ready(function() {
    //CARGAR Y PINTAR DASHBOARD//////////////////////////////////////////////////////////

    for (var i = 0; i < 3; i++) {
        $.get( "json/data"+i+".json", function( resp ) {
            console.log("Cargado chart: ", resp.hits.hits[0])
            var chart = resp.hits.hits[0];

                    addVisToDash(chart, resp.posrot.x, resp.posrot.y, resp.posrot.z, resp.posrot.rotx ,resp.posrot.roty, resp.posrot.rotz);
          });
        /*var promise = genES.getVis(ESService.client, $scope.actualLoadDashboard._source.charts[i].id)
        var actuali = i;
        promise.then(function (resp) {
            console.log("Cargado chart: ", resp.hits.hits[0])
            var chart = resp.hits.hits[0];

            for (var i = 0; i < 3; i++) {
                if ($scope.actualLoadDashboard._source.charts[i].id == chart._id) {
                    $scope.addVisToDash(chart, $scope.actualLoadDashboard._source.charts[i].x, $scope.actualLoadDashboard._source.charts[i].y, $scope.actualLoadDashboard._source.charts[i].z, $scope.actualLoadDashboard._source.charts[i].rotx, $scope.actualLoadDashboard._source.charts[i].roty, $scope.actualLoadDashboard._source.charts[i].rotz);
                }
            }

        })*/
    }

    //////////////////////////////////////AÑADIR VIS A DASHBOARD//////////////////////
   var addVisToDash = function (visall, posx, posy, posz, rotx, roty, rotz) {
        console.log("A AÑADIR", visall);

        vis = visall._source;


        switch (vis.chartType) {
            case "pie":
                var chart = aframedc.pieChart().data(vis.data).depth(1).setId(visall._id);
                dash.addChart(chart, { x: posx, y: posy, z: posz }, { x: rotx, y: roty, z: rotz })
                posx += 150;
                break
            case "bars":
                var chart = aframedc.barChart().data(vis.data).setId(visall._id);
                dash.addChart(chart, { x: posx, y: posy, z: posz }, { x: rotx, y: roty, z: rotz })
                posx += 150;
                break;
            case "curve":
                var chart = aframedc.smoothCurveChart().data(vis.data).setId(visall._id);
                dash.addChart(chart, { x: posx, y: posy, z: posz }, { x: rotx, y: roty, z: rotz })
                posx += 150;
                break;
            case "3DBars":
                var chart = aframedc.barChart3d().data(vis.data).setId(visall._id);
                dash.addChart(chart, { x: posx, y: posy, z: posz }, { x: rotx, y: roty, z: rotz })
                posx += 150;
                break;
            case "bubbles":
                var chart = aframedc.bubbleChart().data(vis.data).setId(visall._id);
                dash.addChart(chart, { x: posx, y: posy, z: posz }, { x: rotx, y: roty, z: rotz })
                posx += 150;
                break;
            default:
                console.log("Esta vacío")
                return
        }

    }////////////////////////////////////////////////

    ///////////////////////////////////////////THREEDC/////////////////////////////////////////
    var container = document.getElementById('AframeDCShow');
    let dash = aframedc.dashboard(container);
    let backgroundEntity = document.createElement("a-entity")
    backgroundEntity.setAttribute("id", "skymap")
    dash.appendChild(backgroundEntity)
    /////////////////////////////////////////////////////////////////////////////////////
});