//global variables
var selectedDistrict;
var clusterFeature;
var heatMapData;
var heatmapLayer;
var choroplethMap;
var choroplethMapInteractive;
var governorate = [];
var markersArray = [];
var IDPsByGovernorates;
var Legend;
var LegendArray=[];
var layerControl;
//intilising map 



$( document ).ready(function() {
    if($(".splash").is(":visible"))
    {
        $(".wrapper").css({"opacity":"0"});
    }
    $(".splash-arrow").click(function()
    {
        $(".splash").slideUp("800", function() {
              $(".wrapper").delay(100).animate({"opacity":"1.0"},800);
         });
    });
});

/*
$(window).scroll(function() {
  var windTop = $(window).scrollTop();
  var splashHeight = $(".splash").height();
  
  if(windTop>(100)){
     $(window).off("scroll");
      $(".splash").slideUp("800", function() {
         $("html, body").animate({"scrollTop":"0px"},100);
     });
     $(".wrapper").animate({"opacity":"1.0"},800);
  } 
  else {
  
  }  
});
*/

$(window).scroll(function() {
      $(window).off("scroll");
      $(".splash").slideUp("800", function() {
      $("html, body").animate({"scrollTop":"0px"},100);
      $(".wrapper").delay(100).animate({"opacity":"1.0"},800);
 });
 });

var map = L.map('map', {
    center: [33.5, 43.5],
    minZoom: 2,
    zoom: 6
});
//creating the initial basemap
// var layer = L.esri.basemapLayer('Gray').addTo(map);
var Imagery = L.esri.basemapLayer('Imagery');
//var streets = L.esri.basemapLayer('Streets').addTo(map);
var streets=L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

var baseMaps = {
    "Streets": streets,
    "Imagery": Imagery
};


layerControl=L.control.layers(baseMaps, null).addTo(map);


IDPsByGovernorate();
createHeatMap();
createMarker(locations);
createChoropleth();

         

/* calling marker create function */
// var cluster = L.markerClusterGroup();
//Colour Scale
// for (var i = 0; i < markers.length; i++) {
//   var a = markers[i];
//   var title = a[2];
//   var marker = L.marker(new L.LatLng(a['Latitude'], a['Longitude']), { title: title });
//   marker.bindPopup(title);
//   cluster.addLayer(marker);
// }
// map.addLayer(cluster);
// Switching basemap
var layerLabels;
$(function() {
    $("#basemaps-panel li a").click(function() {
        console.log($(this).text());
        setBasemap($(this).text());
    });
});
// $('#layers').on('show.bs.collapse', function () {
//        //call a service here 
// });
$('#opener').on('click', function() {
    var panel = $('#slide-panel');
    if (panel.hasClass("visible")) {
        panel.removeClass('visible').animate({
            'margin-left': '-300px'
        });
    } else {
        panel.addClass('visible').animate({
            'margin-left': '0px'
        });
    }
    return false;
});
// var basemaps = document.getElementById('basemaps');
// basemaps.addEventListener('change', function(){
//   setBasemap(basemaps.value);
//   });
//legend
// FIRST LEGEND FOR TESTING
function creatingLegend(layerName){
 Legend = L.control({
    position: 'bottomright'
});
Legend.onAdd = function(map) {
    var legdiv = L.DomUtil.create('div', 'legend');
    
    if (layerName==="cluster") {
    legdiv.innerHTML +=
        '<strong>   <h4>Legend</h4></strong><i> <img src="images/blue-pin_new.png" style="width:18px;height:28px; margin-top:-10px;"></img></i> IDP Locations <br>';
        //'<strong>   <h4>Legend</h4></strong> <br> <i class="circle" style="background:#2d84c8"></i> IDP Locations <br>';
    }

    else if (layerName==="choropleth") {
           var classes = [0, 20, 39, 58, 78, 97, 117],
            labels = [];
                legdiv.innerHTML='<h6>IDP Population By Governorate</h6>';
            for (var i = 0; i < classes.length; i++) {
                legdiv.innerHTML +=
                '<i style="background:' + ChoropheltGetColor(classes[i] + 1) + '"></i> ' +
                classes[i] + (classes[i + 1] ? '&ndash;' + classes[i + 1] + '<br>' : '+');
            }
        }
    return legdiv;
};
Legend.addTo(map);



// var legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map) {

//     var div = L.DomUtil.create('div', 'info legend'),
//         grades = [0, 10, 20, 50, 100, 200, 500, 1000],
//         labels = [];

//     // loop through our density intervals and generate a label with a colored square for each interval
//     for (var i = 0; i < grades.length; i++) {
//         div.innerHTML +=
//             '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
//             grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
//     }

//     return div;
// };

// legend.addTo(map);


}


//loading the shapefiles
function adminLayers(layer) {
        var svg = d3.select(map.getPanes().overlayPane).append("svg");
        var g = svg.append("g").attr("class", "leaflet-zoom-hide");
        d3.json("json/" + layer + ".geojson", function(collection) {
            var bounds = d3.geo.bounds(collection);
            var path = d3.geo.path().projection(project);
            var feature = g.selectAll("path").data(collection.features)
                .enter().append("path").attr('class', layer);
            map.on("viewreset", reset);
            reset();


            function project(x) {
                var point = map.latLngToLayerPoint(new L.LatLng(x[1],
                    x[0]));
                return [point.x, point.y];
            }

            function reset() {
                var bottomLeft = project(bounds[0]);
                var topRight = project(bounds[1]);
                svg.attr("width", topRight[0] - bottomLeft[0]).attr(
                    "height", bottomLeft[1] - topRight[1]).style(
                    "margin-left", bottomLeft[0] + "px").style(
                    "margin-top", topRight[1] + "px");
                g.attr("transform", "translate(" + -bottomLeft[0] +
                    "," + -topRight[1] + ")");
                feature.attr("d", path);
            }
        });
    }
    /* seting up basemap*/

function setBasemap(basemap) {
        if (layer) {
            map.removeLayer(layer);
        }
        layer = L.esri.basemapLayer(basemap);
        map.addLayer(layer);
        // if (layerLabels) {
        //   map.removeLayer(layerLabels);
        // }
        // if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
        //   layerLabels = L.esri.basemapLayer(basemap + 'Labels');
        //   map.addLayer(layerLabels);
        // }
    }
    /*  Creating creater function*/

function createMarker(markers) {
    //Creating clusint feature 
    clusterFeature = new L.markerClusterGroup({
        //custom cluster icon              
        iconCreateFunction: function(cluster) {
            //geting and counting the text length
            var count = cluster.getChildCount();
            var digits = (count + '').length;
            return new L.divIcon({
                html: count,
                className: 'cluster digits-' + digits,
                iconSize: null
            });
        },
        pointToLayer: function(geojson, latlng) {
            var direction = (geojson.properties.direction) ?
                geojson.properties.direction.toLowerCase() :
                'none';
            return L.marker(latlng, {
                icon: icons[direction]
            });
        },
        polygonOptions: {
            color: '#2d84c8',
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.1
        },
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true
    });
   // console.log(markers.length);

    var customIcon = L.Icon.Default.extend({
            options: {
                    iconUrl: 'images/blue-pin_new.png',
                    shadowSize:  [60, 50],
                    iconAnchor:   [7, 28],  // point of the icon which will correspond to marker's location
                    shadowAnchor: [13, 35] 
            }
         });
         var icon = new customIcon();



    for (var i = 0; i < markers.length; ++i) {
        var marker = L.marker([markers[i].Latitude, markers[i].Longitude],{icon:icon}).bindPopup(
            '<strong>' + markers[i].LocationName + '</strong> <br> Famailies: ' +
            markers[i].IDPsFamilies);
        //debugger;
        markersArray.push(marker);
    }
    clusterFeature.addLayers(markersArray);
    map.addLayer(clusterFeature);
    layerControl.addOverlay(clusterFeature , "Locations");
}

function createHeatMap() {
    heatMapData =locations;
    heatMapData= heatMapData.map(function(p) {
        return [p.Latitude, p.Longitude, p.Families];
    });
    heatmapLayer = L.heatLayer(heatMapData, {
        radius: 16,
        minOpacity: 0.4,
        blur: 27,
        gradient: {
            0.2: '#ffffb2',
                0.4: '#fd8d3c',
                0.6: '#fd8d3c',
                0.8: '#f03b20',
                1: '#bd0026'
        }
    }).addTo(map);
        layerControl.addOverlay(heatmapLayer , "heatmap");

}

function ChoropheltGetColor(d) {
    return d > 117 ? '#800026' :
           d > 97  ? '#BD0026' :
           d > 78  ? '#E31A1C' :
           d > 58  ? '#FC4E2A' :
           d > 39  ? '#FD8D3C' :
           d > 20  ? '#FEB24C' :
           d > 0   ? '#FED976' :
                     '#FFEDA0';
}

function ChorophelStyle(feature) {
    for (var i = 0; i<IDPsByGovernorates.length; i++) {
        if (IDPsByGovernorates[i].key===feature.properties.ADM2NAME) {
            console.log(feature.properties.ADM2NAME +" ,"+IDPsByGovernorates[i].key+","+IDPsByGovernorates[i].value+","+feature.properties.area);
     
    return {
        fillColor: ChoropheltGetColor(IDPsByGovernorates[i].value*6/feature.properties.area),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
       }
    }
}
 
function createChoropleth(){

   //  L.geoJson(governorates).addTo(map);
      d3.json("json/gov.geojson", function(collection) {
        choroplethMapInteractive = L.geoJson(collection, {
            style: ChorophelStyle,
            onEachFeature: onEachFeature
        }).addTo(map);
            layerControl.addOverlay(choroplethMapInteractive , "Density of IDP population");

});

}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    choroplethMapInteractive.resetStyle(e.target);
}

function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

  function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }


function removeLayer() {
        markersArray = [];
        clusterFeature.clearLayers();
        map.removeLayer(clusterFeature);
    }

      

//filtering using crossfilter 
function filterData() {
        // var select = document.getElementById("district-select");
        //    console.log(select.selected.length);
        // for (var i = select.length; i > 0; i++) {
        //     if (select.option[i].selected) {
        //         district-select.push(select.options[i]);
        //     }
        // };
        var ndx = crossfilter(locations);
        var gov = ndx.dimension(function(d) {
            return d.Governorate;
        });
        var anbar = gov.filter(function(d) {
            return governorate.indexOf(d) > -1;
        });
        var test = anbar.top(Number.POSITIVE_INFINITY);
        removeLayer();
        createMarker(test);
        // print_filter("anbar");
    }
    // test 

function print_filter(filter) {
        var f = eval(filter);
        if (typeof(f.length) != "undefined") {} else {}
        if (typeof(f.top) != "undefined") {
            f = f.top(Infinity);
        } else {}
        if (typeof(f.dimension) != "undefined") {
            f = f.dimension(function(d) {
                return "";
            }).top(Infinity);
        } else {}
        console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace(
            "[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
    }
    // var a = [{ value:"4a55eff3-1e0d-4a81-9105-3ddd7521d642", display:"Jamsheer"}, { value:"644838b3-604d-4899-8b78-09e4799f586f", display:"Muhammed"}, { value:"b6ee537a-375c-45bd-b9d4-4dd84a75041d", display:"Ravi"}, { value:"e97339e1-939d-47ab-974c-1b68c9cfb536", display:"Ajmal"},  { value:"a63a6f77-c637-454e-abf2-dfb9b543af6c", display:"Ryan"}]
    // var b = [{ value:"4a55eff3-1e0d-4a81-9105-3ddd7521d642", display:"Jamsheer", $$hashKey:"008"}, { value:"644838b3-604d-4899-8b78-09e4799f586f", display:"Muhammed", $$hashKey:"009"}, { value:"b6ee537a-375c-45bd-b9d4-4dd84a75041d", display:"Ravi", $$hashKey:"00A"}, { value:"e97339e1-939d-47ab-974c-1b68c9cfb536", display:"Ajmqal", $$hashKey:"00B"}]
    // var onlyInA = a.filter(function(current){
    //     return b.filter(function(current_b){
    //         return current_b.value == current.value && current_b.display == current.display
    //     }).length == 0
    // });
    // var onlyInB = b.filter(function(current){
    //     return a.filter(function(current_a){
    //         return current_a.value == current.value && current_a.display == current.display
    //     }).length == 0
    // });
    // var result = onlyInB.concat(onlyInA);
    // console.log(result);
    //Adding filters to the map
    //populating district list based on seleced governorate

/*****************************************************************
//Data aggregation
//preparing data for the Choropleth map: summarizing families by Governorates 
/*****************************************************************
*/
function IDPsByGovernorate(feature){
    var cf = crossfilter(locations);
    var governoratesDimension = cf.dimension(function(d) {return d.Governorate});
    var governorateGroup = governoratesDimension.group().reduceSum(function(cf){return cf.IDPsFamilies;});
     IDPsByGovernorates= governorateGroup.all();  
     //console.log(IDPsByGovernorates);
    
}

