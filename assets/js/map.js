import maplibregl from "maplibre-gl";
const Map = {
    mounted() {
        this.props = { id: this.el.getAttribute("data-id") };
        this.pinBuffer = null;
        this.mapLoaded = false;
        this.modal = null;
        this.clickedLngLat = null;
        this.markers = []; // Custom array to manage markers

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
                // Prevent modal if clicking on a marker
                if (e.originalEvent && e.originalEvent.target) {
                    // maplibre-gl markers have class 'maplibregl-marker' or are inside such an element
                    let el = e.originalEvent.target;
                    while (el) {
                        if (el.classList && el.classList.contains('maplibregl-marker')) {
                            return;
                        }
                        el = el.parentElement;
                    }
                }
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

    addPins(pins) {
        console.log("addPins called with pins:", pins);
        pins.forEach(pin => {
            console.log("Adding pin to map:", pin);
            const lngLat = [pin.lng, pin.lat];
            const popup = new maplibregl.Popup().setHTML(`
                <div>
                    <h3>${pin.title}</h3>
                    ${pin.is_owner ? `
                        <div style="margin-top: 0.5em;">
                            <button id="edit-pin-${pin.id}" style="margin-right: 0.5em; padding: 0.3em 0.6em; background: #38a169; color: white; border: none; border-radius: 4px;">Edit</button>
                            <button id="delete-pin-${pin.id}" style="padding: 0.3em 0.6em; background: #e53e3e; color: white; border: none; border-radius: 4px;">Delete</button>
                        </div>
                    ` : ''}
                </div>
              `);

            const marker = new maplibregl.Marker()
              .setLngLat(lngLat)
              .setPopup(popup)
              .addTo(this.props.map);

            this.markers.push({ id: pin.id, marker }); // Add marker to custom array

            popup.on('open', () => {
                console.log("Popup opened for pin:", pin);
                const editButton = document.getElementById(`edit-pin-${pin.id}`);
                const deleteButton = document.getElementById(`delete-pin-${pin.id}`);

                if (editButton) {
                    console.log("Attaching edit listener for pin:", pin);
                    editButton.onclick = (e) => {
                        e.stopPropagation(); // Prevent map click event
                        console.log("Edit button clicked for pin:", pin);
                        this.showPinModal(pin);
                    };
                } else {
                    console.warn("Edit button not found for pin:", pin);
                }

                if (deleteButton) {
                    console.log("Attaching delete listener for pin:", pin);
                    deleteButton.onclick = (e) => {
                        e.stopPropagation(); // Prevent map click event
                        console.log("Delete button clicked for pin:", pin);
                        this.deletePin(pin);
                    };
                } else {
                    console.warn("Delete button not found for pin:", pin);
                }
            });
        });
    },

    showPinModal(pin = null) {
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

        const isEdit = !!pin;
        const modalTitle = isEdit ? 'Edit Pin' : 'Add Pin';
        const pinTitle = isEdit ? pin.title : '';
        const isOwner = pin && pin.is_owner; // Check ownership

        this.modal.innerHTML = `
            <div class="pin-modal-content" style="padding: 2em; border-radius: 8px; min-width: 300px; box-shadow: 0 2px 16px rgba(0,0,0,0.1);">
                <h2 style="margin-bottom: 1em;">${modalTitle}</h2>
                <input id="pin-title" type="text" placeholder="Title" value="${pinTitle}" style="width: 100%; margin-bottom: 1em; padding: 0.5em;" />
                <div style="display: flex; gap: 1em; justify-content: flex-end;">
                    <button id="pin-cancel" style="padding: 0.5em 1em;">Cancel</button>
                    ${isEdit && isOwner ? `<button id="pin-delete" style="padding: 0.5em 1em; background: #e53e3e; color: white; border: none; border-radius: 4px;">Delete</button>` : ''}
                    <button id="pin-save" style="padding: 0.5em 1em; background: #38a169; color: white; border: none; border-radius: 4px;">${isEdit ? 'Save' : 'Add'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        document.getElementById('pin-cancel').onclick = () => this.closePinModal();
        document.getElementById('pin-save').onclick = () => isEdit ? this.updatePin(pin) : this.savePin();
        if (isEdit && isOwner) {
            document.getElementById('pin-delete').onclick = () => this.deletePin(pin);
        }
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
              console.log('Backend response for new pin:', data);
              this.closePinModal();

              if (data && data.data.id) {
                  const newPin = {
                      id: data.data.id,
                      title,
                      lat: data.data.latitude,
                      lng: data.data.longitude,
                      is_owner: data.data.is_owner !== undefined ? data.data.is_owner : true // Fallback to true
                  };
                  console.log('Adding new pin to map:', newPin);
                  this.addPins([newPin]);
              } else {
                  console.error('Failed to create pin. Invalid response:', data);
              }
          }).catch(error => {
              console.error('Error creating pin:', error);
          });
    },

    updatePin(pin) {
        const title = document.getElementById('pin-title').value;
        if (!title) return;
        fetch(`/api/pins/${pin.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: { title } })
        }).then(res => res.json())
          .then(data => {
              console.log('Pin updated:', data);
              pin.title = title; // Update the pin's title locally

              // Update the popup content
              const markerObj = this.markers.find(m => m.id === pin.id);
              if (markerObj) {
                  markerObj.marker.getPopup().setHTML(`
                    <div>
                        <h3>${pin.title}</h3>
                        ${pin.is_owner ? `
                            <div style="margin-top: 0.5em;">
                                <button id="edit-pin-${pin.id}" style="margin-right: 0.5em; padding: 0.3em 0.6em; background: #38a169; color: white; border: none; border-radius: 4px;">Edit</button>
                                <button id="delete-pin-${pin.id}" style="padding: 0.3em 0.6em; background: #e53e3e; color: white; border: none; border-radius: 4px;">Delete</button>
                            </div>
                        ` : ''}
                    </div>
                  `);
              }

              this.closePinModal();
          });
    },

    deletePin(pin) {
        if (!confirm('Are you sure you want to delete this pin?')) return;
        fetch(`/api/pins/${pin.id}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                console.log('Pin deleted:', pin);

                // Remove the pin from the map
                const markerIndex = this.markers.findIndex(m => m.id === pin.id);
                if (markerIndex !== -1) {
                    this.markers[markerIndex].marker.remove();
                    this.markers.splice(markerIndex, 1); // Remove from custom array
                }

                this.closePinModal();
            }
        });
    },

};

export default Map;