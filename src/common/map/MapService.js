(function() {
  var module = angular.module('loom_map_service', []);

  var dragZoomActive = false;

  module.provider('mapService', function() {
    this.$get = function() {
      // create map on init so that other components can use map on their init
      this.map = this.createMap();
      return this;
    };

    this.activateDragZoom = function() {
      //first we need to get access to the map's drag zoom interaction, if there is one
      var index;
      for (index = 0; index < this.map.getInteractions().getLength(); ++index) {
        if (this.map.getInteractions().getArray()[index] instanceof ol.interaction.DragZoom) {
          break;
        }
      }
      if (index == this.map.getInteractions().getLength()) {
        alert('Drag zoom interaction is not supported on this map');
        return;
      }

      //set the condition to always so that drag zoom will activate anytime the map is dragged
      this.map.getInteractions().getArray()[index].condition_ = ol.interaction.condition.always;
      dragZoomActive = true;
    };

    this.zoomToExtent = function(extent) {
      var view = this.map.getView().getView2D();

      if (extent === undefined) {
        extent = view.getProjection().getExtent();
      }

      view.fitExtent(extent, this.map.getSize());
    };

    this.getFeatureLayers = function() {
      var layers = [];

      //TODO: do a better job at removing all layers except those that have a feature type.
      this.map.getLayers().forEach(function(layer) {
        if (!(layer.source_ instanceof ol.source.OSM)) {
          layers.push(layer);
        }
      });

      return layers;
    };

    this.createMap = function() {
      var map = new ol.Map({
        layers: [

          new ol.layer.Tile({
            label: 'OpenStreetMap',
            metadata: {serverId: 1},
            source: new ol.source.OSM()
          }),
          new ol.layer.Vector({
            source: new ol.source.Vector({
              parser: new ol.parser.GeoJSON(),
              url: 'points.geojson'
            }),
            style: new ol.style.Style({
              rules: [
                new ol.style.Rule({
                  symbolizers: [
                    new ol.style.Fill({
                      color: '#ff0000',
                      opacity: 1
                    }),
                    new ol.style.Stroke({
                      color: '#000000',
                      opacity: 1,
                      width: 2
                    }),
                    new ol.style.Shape({
                      size: 10,
                      fill: new ol.style.Fill({
                        color: '#ff0000',
                        opacity: 1
                      }),
                      stroke: new ol.style.Stroke({
                        color: '#000000',
                        opacity: 1,
                        width: 2
                      })
                    })
                  ]
                })
              ],
              symbolizers: [
                new ol.style.Fill({
                  color: '#ffff00',
                  opacity: 0.8
                }),
                new ol.style.Stroke({
                  color: '#ff8000',
                  opacity: 0.8,
                  width: 3
                }),
                new ol.style.Shape({
                  size: 10,
                  fill: new ol.style.Fill({
                    color: '#ffff00',
                    opacity: 0.8
                  }),
                  stroke: new ol.style.Stroke({
                    color: '#ff8000',
                    opacity: 0.8,
                    width: 3
                  })
                })
              ]
            })
          })
        ],
        controls: ol.control.defaults().extend([
          new ol.control.FullScreen(),
          new ol.control.ZoomSlider(),
          new ol.control.MousePosition({
            projection: 'EPSG:4326',
            coordinateFormat: ol.coordinate.toStringHDMS
          }),
          new ol.control.ScaleLine({className: 'metric-scale-line ol-scale-line',
            units: ol.control.ScaleLineUnits.METRIC}),
          new ol.control.ScaleLine({className: 'imperial-scale-line ol-scale-line',
            units: ol.control.ScaleLineUnits.IMPERIAL})
        ]),
        interactions: ol.interaction.defaults().extend([
          new ol.interaction.DragRotate()
        ]),
        renderer: ol.RendererHint.CANVAS,
        target: 'map',
        view: new ol.View2D({
          center: ol.proj.transform([-87.2011, 14.1], 'EPSG:4326', 'EPSG:3857'),
          zoom: 14
        })
      });


      // Defines default vector style
      ol.style.setDefault(new ol.style.Style({
        rules: [
          new ol.style.Rule({
            filter: 'renderintent("selected")',
            symbolizers: [
              new ol.style.Fill({
                color: '#ff0000',
                opacity: 1
              }),
              new ol.style.Stroke({
                color: '#000000',
                opacity: 1,
                width: 2
              }),
              new ol.style.Shape({
                size: 10,
                fill: new ol.style.Fill({
                  color: '#ff0000',
                  opacity: 1
                }),
                stroke: new ol.style.Stroke({
                  color: '#000000',
                  opacity: 1,
                  width: 2
                })
              })
            ]
          })
        ],
        symbolizers: [
          new ol.style.Fill({
            color: '#ffff00',
            opacity: 0.8
          }),
          new ol.style.Stroke({
            color: '#ff8000',
            opacity: 0.8,
            width: 3
          }),
          new ol.style.Shape({
            size: 10,
            fill: new ol.style.Fill({
              color: '#ffff00',
              opacity: 0.8
            }),
            stroke: new ol.style.Stroke({
              color: '#ff8000',
              opacity: 0.8,
              width: 3
            })
          })
        ]
      }));


      map.on('dragend', function() {
        if (dragZoomActive === false) {
          return;
        }
        var index;
        for (index = 0; index < this.getInteractions().getLength(); ++index) {
          if (this.getInteractions().getArray()[index] instanceof ol.interaction.DragZoom) {
            break;
          }
        }
        if (index == this.getInteractions().getLength()) {
          alert('Drag zoom interaction is not supported on this map');
          return;
        }

        //Reset the condition to its default behavior after each use
        this.getInteractions().getArray()[index].condition_ = ol.interaction.condition.shiftKeyOnly;
        dragZoomActive = false;
      });

      return map;
    };
  });
}());
/*
 ,
 style: new ol.style.Style({rules: [
 new ol.style.Rule({
 symbolizers: [
 new ol.style.Fill({
 color: 'white',
 opacity: 0.6
 }),
 new ol.style.Stroke({
 color: '#319FD3',
 opacity: 1
 })
 ]
 }),
 new ol.style.Rule({
 maxResolution: 5000,
 symbolizers: [
 new ol.style.Text({
 color: 'black',
 text: ol.expr.parse('name'),
 fontFamily: 'Calibri,sans-serif',
 fontSize: 12,
 stroke: new ol.style.Stroke({
 color: 'white',
 width: 3
 })
 })
 ]
 })
 ]})
 })
 /*,
 new ol.layer.Vector({
 source: new ol.source.Vector({
 source: new ol.source.Vector({
 parser: new ol.parser.KML(),
 url: '2012_Earthquakes_Mag5.kml'
 })
 }),
 style: new ol.style.Style({
 symbolizers: [
 new ol.style.Shape({
 size: ol.expr.parse('5 + 20 * (magnitude - 5)'),
 fill: new ol.style.Fill({
 color: '#ff9900',
 opacity: 0.4
 }),
 stroke: new ol.style.Stroke({
 color: '#ffcc00',
 opacity: 0.2
 })
 })
 ]
 })
 })
 /*
 //NOTE: TODO: do not commit
 new ol.layer.Tile({
 source: new ol.source.TileWMS({
 url: 'http://192.168.10.217/geoserver/wms',
 //url: 'http://geoserver.rogue.lmnsolutions.com/geoserver/wms',
 params: {
 //'LAYERS': {'geonode:incidentes_copeco', 'geonode:canchas_de_futbol'}
 'LAYERS': 'geonode:canchas_de_futbol'
 },
 getFeatureInfoOptions: {
 'method': ol.source.WMSGetFeatureInfoMethod.XHR_GET,
 'params': {
 'INFO_FORMAT': 'application/json',
 'FEATURE_COUNT': 50
 }
 }
 })
 }),

 new ol.layer.Tile({
 source: new ol.source.TileWMS({
 url: 'http://192.168.10.217/geoserver/wms',
 //url: 'http://geoserver.rogue.lmnsolutions.com/geoserver/wms',
 params: {
 //'LAYERS': 'geonode:incidentes_copeco'
 'LAYERS': 'geonode:incidentes_copeco'
 },
 getFeatureInfoOptions: {
 'method': ol.source.WMSGetFeatureInfoMethod.XHR_GET,
 'params': {
 'INFO_FORMAT': 'application/json',
 'FEATURE_COUNT': 50
 }
 }
 })
 })
 */

