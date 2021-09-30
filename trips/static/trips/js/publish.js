Vue.component('ano-component', {
    data: function() {
        return {
            years: [],
            selected: ''
        }
    },
    mounted: function() {
        axios.get('https://www.fueleconomy.gov/ws/rest/vehicle/menu/year')
        .then((response) => {
            response.data["menuItem"].forEach(element => {
                this.years.push(element)
            });
        })
    },
    methods: {
        updateSelected: function() {
                this.$emit("update", this.selected) 
        }
    },
    template: `
        <select class="form-select mb-3" @change="updateSelected" v-model="selected">
            <option value="" selected>Año</option>
            <option v-for="opt in years" :key="opt.text" :value="opt.value">{{opt.text}}</option>
        </select>
    `,
})

Vue.component('marca-component', {
    props: ['year'],
    data: function() {
        return {
            makes: [],
            selected: '',
            disabled: true,
        }
    },
    methods: {
        getMakes: function(year) {
            const makes = [];
            if (year) {
                             
            }
            return makes
        },
        updateSelected: function() {
            this.$emit("update", this.selected)
        }
    },
    watch: {
        year: function(val, oldVal) {
            this.makes = []
            if (val) {
                axios.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year=${val}`)
                .then((response) => {
                    response.data["menuItem"].forEach(element => {
                        this.makes.push(element)
                    })
                    this.disabled = false
                }) 
            } else {
                this.selected = ''
                this.disabled = true 
            }
            this.updateSelected()
        }
    },
    template: `
    <select id="marca" class="form-select mb-3" @change="updateSelected" v-model="selected" :disabled="disabled">
        <option value="" selected>Marca</option>
        <option v-for="make in makes" :key="make.text" :value="make.value">{{make.text}}</option>
    </select>
    `,
})

Vue.component('modelo-component', {
    props: ['year', 'make'],
    data: function() {
        return {
            models: [],
            selected: '',
            disabled: true,
        }
    },
    methods: {
        getModels: function(year, make) {
            const models = []
            axios.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`)
            .then((response) => {
                response.data["menuItem"].forEach(element => {
                    models.push(element)
                })
            })
            return models
        },
        updateSelected: function() {
            this.$emit("update", this.selected)
        }
    },
    watch: {
        make: function(val, oldVal) {
            this.models = []
            if (val) {
                this.models = this.getModels(this.year, this.make)
                this.disabled = false
            } else {
                this.selected = ''
                this.disabled = true
            }
            this.updateSelected()
        },
    },
    template:`
    <select id="modelo" class="form-select mb-3" @change="updateSelected" v-model="selected" :disabled="disabled">
        <option value="" selected>Modelo</option>
        <option v-for="model in models" :key="model.text" :value="model.value">{{model.text}}</option>
    </select>
    `
})

Vue.component('opciones-component', {
    props: ['year', 'make', 'model'],
    data: function() {
        return {
            opciones: [],
            selected: '',
            disabled: true,
        }
    },
    methods: {
        getOptions: function(year, make, model) {
            const options = []
            axios.get(`https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`)
            .then((response) => {
                const data = response.data.menuItem
                try {
                    data.forEach(element => {
                        options.push(element)
                    })
                } catch {
                    options.push(data)
                }               
            })
            return options
        },
        updateSelected: function() {
            this.$emit("update", this.selected)
        }
    },
    watch: {
        model: function(val, oldVal) {
            if (val) {
                this.opciones = this.getOptions(this.year, this.make, this.model)
                this.disabled = false
            } else {
                this.opciones = []
                this.selected = ''
                this.disabled = true
            }
            this.updateSelected()
        }
    },
    template: `
    <select id="opciones" class="form-select mb-3" @change="updateSelected" v-model="selected" :disabled="disabled">
        <option value="" selected>Opciones</option>
        <option v-for="opcion in opciones" :key="opcion.text" :value="opcion.value">{{opcion.text}}</option>
    </select> `
})


Vue.component('google-map-component', {
    data: function() {
        return {
            google: null,
            map: null,
            mapConfig: {
                //gestureHandling: 'none',
                //mapTypeControl: false,
                zoom: 10,
                center: {lat: 18.485974694207638, lng: -69.9315511722175}
            }
        }
    },
    mounted: async function() {
        const googleMapApi = await new google.maps.plugins.loader.Loader({
            apiKey: 'AIzaSyAgJH1zyZMTtNpabmKXAHbWCdfUoA40BK4',
            version: "weekly",
            libraries: ["places"]
        })
        this.google = await googleMapApi.load()
        this.google = window.google
        this.initMap()
        this.google.maps.UnitSystem.METRIC
        this.$emit('update', {google: this.google, map: this.map})
    },
    methods: {
        initMap: function() {
            const mapContainer = this.$refs.googleMap
            //console.log(this.google.hasProperty('maps'))
            this.map = new this.google.maps.Map(mapContainer, this.mapConfig)
        }
    },
    template:`
    <div>
        <div class="img-fluid" style="width: 100%; height: 640px;" ref="googleMap"></div>
    </div>
    `
})

Vue.component('google-autocomplete-component', {
    props: ['google', 'map'],
    data: function() {
        return {
            originAutocomplete: null,
            originPlace: null,
            destAutocomplete: null,
            destPlace: null,
            travelMode: this.google.maps.TravelMode.DRIVING,
            directionsService: new this.google.maps.DirectionsService(),
            directionsRenderer:new this.google.maps.DirectionsRenderer(),
            unitSystem: this.google.maps.UnitSystem.METRIC,
            routeDistance: null,
            options: {
                fields: ["place_id", "formatted_address"],
                strictBounds: true,
                componentRestrictions: {
                    country: 'do',

                }
            }
        }
    },
    methods: {
        updateDistance: function() {
            this.$emit('update', this.routeDistance)
        },
        updateAddress: function() {
            this.$emit('address', this.originPlace)
        },
        route: function() {
            if (!this.originPlace || !this.destPlace) {
                return
            }
            const me = this
            this.directionsService.route({
                origin: { placeId: this.originPlace.place_id},
                destination: { placeId: this.destPlace.place_id },
                travelMode: this.travelMode
            }, 
            function(response, status) {
                if (status === "OK") {
                    const distance = response.routes[0].legs[0].distance.value
                    distance ? me.routeDistance = distance : null
                    me.directionsRenderer.setDirections(response);
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            })
        },
        setupPlaceChangedListener: function(autocomplete, mode) {
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace()
                if (!place.place_id) {
                    window.alert("Please select an option from the dropdown list.");
                    return;
                }
                if (mode === "ORIG") {
                    this.originPlace = place;
                } else {
                    this.destPlace = place;
                }
                this.route()
            })
        }
    },
    mounted: function() {
        this.directionsRenderer.setMap(this.map)
        const originInput = this.$refs.start
        const destInput = this.$refs.end
        
        this.originAutocomplete = new this.google.maps.places.Autocomplete(originInput, this.options)
        this.destAutocomplete = new this.google.maps.places.Autocomplete(destInput, this.options)

        this.setupPlaceChangedListener(this.originAutocomplete, "ORIG")
        this.setupPlaceChangedListener(this.destAutocomplete, "DEST")
    },
    watch: {
        routeDistance: function(val) {
            this.updateDistance()
        },
        originPlace: function(val) {
            this.updateAddress()
        }
    },
    template: `
    <div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="start" placeholder="Origen" ref="start">
            <label for="end">Origen</label>
        </div>
        <div class="form-floating mb-3">
            <input type="text" class="form-control" id="end" placeholder="Destino" ref="end">
            <label for="end">Destino</label>
        </div>
    </div>
    `

})


Vue.component('modal-body-component', {
    props: ['startAddress', 'map'],
    template: `
    <div class="d-flex flex-column align-items-center my-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-info-circle mb-3" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
        <h4 class="display-6 fw-normal mb-5">Confirmar Viaje</h4>
        <div class="row">
            <div class="col-5 d-flex align-items-baseline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pin-map" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8l3-4z"/>
                <path fill-rule="evenodd" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z"/>
                </svg>
                <h4 class="ms-2">{{startAddress}}</h4>
            </div>
            <div class="col-2 d-flex justify-content-center align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                </svg>
            </div>
            <div class="col-5 d-flex align-items-baseline justify-content-end">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pin-map" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8l3-4z"/>
                    <path fill-rule="evenodd" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z"/>
                </svg>
                <h4 class="ms-2">End location</h4>
            </div>
        </div>
    </div>
    `

})


var app = new Vue({
    el: '#app',
    data: {
        year: '',
        make: '',
        model: '',
        opcion: '',
        roundedMpg: null,
        unroundedMpg: null,
        distance: 0,
        google: null,
        map: null,
        precioGasolina: 261.80,
        disabled: true,
        startAddress: null
    },
    computed: {
        distanceKm: function() {
            return this.distance / 1000
        },
        Kmg: function() {
            if (this.unroundedMpg) {
                return this.unroundedMpg * 1.609
            }
            return this.roundedMpg * 1.609
        },
        roundedKmg: function() {
            return this.redondear(this.Kmg)
        },
        consumo: function() {
            return this.distanceKm / this.Kmg
        },
        costo: function() {
            return this.consumo * this.precioGasolina
        }
    },
    methods: {
        redondear: function(number) {
            var m = Number((Math.abs(number) * 100).toPrecision(15));
            return Math.round(m) / 100 * Math.sign(number);
        },
        updateYear: function(year) {
            this.year = year
        },
        updateMake: function(make) {
            this.make = make
        },
        updateModel: function(model) {
            this.model = model
        },
        updateOpcion: function(opcion) {
            this.opcion = opcion
        },
        updateGoogle: function(googleObj) {
            this.google = googleObj.google
            this.map = googleObj.map
        },
        updateDistance: function(distance){
            this.distance = distance
        },
        updateAddress: function(address) {
            console.log('receiving')
            
        }
    },
    watch: {
        opcion: function(val, oldVal) {
            if (val) {
                const url = `https://www.fueleconomy.gov/ws/rest/vehicle/${val}`
                axios.get(url)
                .then((response) => {
                    this.roundedMpg = parseFloat(response.data['comb08'])
                    this.unroundedMpg = parseFloat(response.data['comb08U'])
                })
            }
        }
    }
})