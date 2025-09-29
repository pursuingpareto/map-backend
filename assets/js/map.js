import maplibregl from "maplibre-gl";
const Map = {
    mounted() {
        this.props = { id: this.el.getAttribute("data-id") };
        this.pinBuffer = null;
        this.mapLoaded = false;
        this.handleEvent(`map:${this.props.id}:init`, ({ ml }) => {
            const map = {container: "map", style: ml}
            this.props.map = new maplibregl.Map(map);
            this.props.map.on('load', () => {
                this.mapLoaded = true;
                if (this.pinBuffer) {
                    this.addPins(this.pinBuffer);
                    this.pinBuffer = null;
                }
            });
        });
        this.handleEvent(`map:${this.props.id}:add`, ({ layer }) => {
            this.props.map.addLayer(layer);
        });
        this.handleEvent(`map:${this.props.id}:pins`, ({ pins }) => {
            if (!this.props.map || !this.mapLoaded) {
                this.pinBuffer = pins;
                return;
            }
            this.addPins(pins);
        });
    },

    addPins(pins) {
        pins.forEach(pin => {
            const lngLat = [pin.lng, pin.lat];
            const marker = new maplibregl.Marker()
              .setLngLat(lngLat)
              .setPopup(new maplibregl.Popup().setText(pin.title))
              .addTo(this.props.map);
        });
    },
};

export default Map;