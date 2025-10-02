import maplibregl from "maplibre-gl";
const Map = {
    mounted() {
        this.props = { id: this.el.getAttribute("data-id") };
        this.pinBuffer = null;
        this.mapLoaded = false;
        this.modal = null;
        this.clickedLngLat = null;
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
            this.props.map.on('click', (e) => {
                this.clickedLngLat = e.lngLat;
                this.showPinModal();
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

    showPinModal() {
        if (this.modal) return;
        this.modal = document.createElement('div');
        this.modal.style.position = 'fixed';
        this.modal.style.top = '0';
        this.modal.style.left = '0';
        this.modal.style.width = '100vw';
        this.modal.style.height = '100vh';
        this.modal.style.background = 'rgba(0,0,0,0.4)';
        this.modal.style.display = 'flex';
        this.modal.style.alignItems = 'center';
        this.modal.style.justifyContent = 'center';
        this.modal.style.zIndex = '1000';
        this.modal.innerHTML = `
            <div style="background: white; padding: 2em; border-radius: 8px; min-width: 300px; box-shadow: 0 2px 16px #0002;">
                <h2 style="margin-bottom: 1em;">Add Pin</h2>
                <input id="pin-title" type="text" placeholder="Title" style="width: 100%; margin-bottom: 1em; padding: 0.5em;" />
                <div style="display: flex; gap: 1em; justify-content: flex-end;">
                    <button id="pin-cancel" style="padding: 0.5em 1em;">Cancel</button>
                    <button id="pin-save" style="padding: 0.5em 1em; background: #38a169; color: white; border: none; border-radius: 4px;">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
        document.getElementById('pin-cancel').onclick = () => this.closePinModal();
        document.getElementById('pin-save').onclick = () => this.savePin();
    },

    closePinModal() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
            this.clickedLngLat = null;
        }
    },

    savePin() {
        const title = document.getElementById('pin-title').value;
        if (!title || !this.clickedLngLat) return;
        fetch('/api/pins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"pin":{
                title,
                latitude: this.clickedLngLat.lat,
                longitude: this.clickedLngLat.lng
            }})
        }).then(res => res.json())
          .then(data => {
              this.closePinModal();
              console.log('Pin saved:', data);
              // Optionally, add the new pin to the map immediately
              if (data && data.data.id) {
                  this.addPins([{ id: data.id, title, lat: data.data.latitude, lng: data.data.longitude }]);
              }
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