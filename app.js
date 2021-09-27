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
            apiKey: '',
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
        <div style="width: 100%; height: 340px;" ref="googleMap"></div>
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
                fields: ["place_id"],
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
        precioGasolina: 261.80
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
