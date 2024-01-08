/*
  Generic  Canvas Layer for leaflet 0.7 and 1.0-rc, 1.2, 1.3
  copyright Stanislav Sumbera,  2016-2018, sumbera.com , license MIT
  originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288  
  
  also thanks to contributors: heyyeyheman,andern,nikiv3, anyoneelse ?
  enjoy !
*/

L.CanvasLayer = L.Layer.extend({ 

    initialize: function (autoFit = true, options) {
        this._map    = null;
        this._canvas = null;
        this._delegate = null;
        this._autoFit = autoFit;
        L.setOptions(this, options);
    },

    delegate: function(del){
        this._delegate = del;
        return this;
    },

    /* added by dhshin */
    fitCanvasToContainer: function() {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
    },

    // resize listener
    _onLayerDidResize: function (resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    
    // moveend listener
    _onLayerDidMove: function (e) {
        this.drawLayer();
        if (this._autoFit) {
            this.fitCanvasToContainer();
        }
    },

    // zoom listener
    _onLayerDidZoom: function (e) {
    },

    // zoomanim listener
    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom);
        var offset = this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), e.zoom, e.center).min;
        L.DomUtil.setTransform(this._canvas, offset, scale);
    },

    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

        map._panes.overlayPane.appendChild(this._canvas);

        map.on(this.getEvents(), this);
        
        var del = this._delegate || this;
        del.onLayerDidMount && del.onLayerDidMount();

        this.fitCanvasToContainer();
        this.drawLayer();
        
        return this;
    },

    onRemove: function (map) {
        var del = this._delegate || this;
        del.onLayerWillUnmount && del.onLayerWillUnmount();

        map.getPanes().overlayPane.removeChild(this._canvas);
 
        map.off(this.getEvents(),this);
        
        this._canvas = null;
        return this;
    },

    getEvents: function () {
        var events = {
            resize: this._onLayerDidResize,
            moveend: this._onLayerDidMove,
            zoom: this._onLayerDidZoom
        };
        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            events.zoomanim =  this._animateZoom;
        }

        return events;
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    LatLonToMercator: function (latlon) {
        return {
            x: latlon.lng * 6378137 * Math.PI / 180,
            y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
        };
    },

    /* added by dhshin */
    getViewInfo() {
        var size   = this._map.getSize();
        var bounds = this._map.getBounds();
        var zoom   = this._map.getZoom();

        var center = this.LatLonToMercator(this._map.getCenter());
        var corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()));

        return {
            layer : this,
            canvas: this._canvas,
            bounds: bounds,
            size: size,
            zoom: zoom,
            center : center,
            corner : corner
        };
    },

    drawLayer: function () {
        let info = this.getViewInfo();
        var del = this._delegate || this;
        del.onDrawLayer && del.onDrawLayer(info);
    }
});

L.canvasLayer = function (autoFit, options) {
    return new L.CanvasLayer(autoFit, options);
};
