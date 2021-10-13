
Vue.component('select-component', {
    data: function() {
        return {
            origenes: null,
            destinos: null,
            origen: '',
            destino: ''
        }
    },
    mounted: function() {
        fetch('/find?mode=all')
        .then(response => response.json())
        .then((data) => {
            this.origenes = data.origenes
            this.destinos = data.destinos
        })
        .catch((e) => {
            console.log(e)
        })
    },
    methods: {
        updateTrips: function() {
            let params = new URLSearchParams({
                origen: this.origen, 
                destino: this.destino,
                mode: 'filter'
            })
            let url = '/find?' + params.toString()
            fetch(url)
            .then((response) => response.json())
            .then((data) => {
                this.$emit("update", data.trips) 
            })
            .catch((e) => {
                console.log(e)
            })

        }
    },
    template: `
    <div class="p-4 p-md-5 border rounded-3 shadow-sm bg-light">
        <div class="mb-4">
            <label for="select-origen" class="form-label fw-bold">Origen</label>
            <select id="select-origen" class="form-select form-select-sm mb-3" v-model="origen">
                <option value="" selected>Origen</option>
                <option v-if="origenes" v-for="loc in origenes" :key="loc" :value="loc">{{loc}}</option>
            </select>
        </div>
        <div>
            <label for="select-origen" class="form-label fw-bold">Destino</label>
            <select id="select-origen" class="form-select form-select-sm mb-3" v-model="destino">
                <option value="" selected>Destino</option>
                <option v-if="destinos" v-for="loc in destinos" :key="loc" :value="loc">{{loc}}</option>
            </select>
        </div>
        <button type="button" class="d-flex ms-auto btn btn-sm btn-secondary" @click="updateTrips">Buscar</button>
    </div>
    `
}),


Vue.component('trip-component', {
    props: ['trip'],
    data: function() {
        return {
            origen: this.trip.origen,
            destino: this.trip.destino,
            dateCreated: this.trip.date_created,
            mapUrl: "https://maps.googleapis.com/maps/api/staticmap?style=feature:poi|visibility:off&style=feature:transit|visibility:off&path=weight:3|enc:"+this.trip.polyline+"&size=300x200&scale=2&maptype=roadmap&key=AIzaSyDhskcdBb5bski_oNDm05P6A4eGiOcbaSQ"
        }
    },
    template: `
        <div class="card shadow-sm mb-3" style="max-height: 200px;">
            <div class="row g-0">
                <div class="col-md-3">
                    <img style="max-width: 100%; height: 180px;" alt="..." :src="mapUrl">
                </div>
                <div id="trip-card" class="col-md-9">
                    <a href="#" class="text-decoration-none">    
                        <div class="card-body">
                            <div class="row row-cols-md-2">
                                <div class="col">
                                    <div class="p-3">
                                        <h5 class="card-title mb-1">{{origen.name}}</h5>
                                        <p class="card-text">{{origen.formatted_address}}</p>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="p-3">
                                        <h5 class="card-title mb-1">{{destino.name}}</h5>
                                        <p class="card-text">{{destino.formatted_address}}</p>
                                    </div>
                                </div>
                            </div>
                            <p class="card-text px-3"><small class="text-muted">Creado {{dateCreated}}</small></p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    `
})

var app = new Vue({
    el: '#app',
    data: {
        origenes: null,
        destinos: null,
        trips: null,
    },
    methods: {
        updateTrips: function(trips) {
            this.trips = trips
        }
    },
    mounted: function() {
        fetch('/find?mode=all')
        .then(response => response.json())
        .then((data) => {
            this.origenes = data.origenes
            this.destinos = data.destinos
            this.trips = data.trips
        })
        .catch((e) => {
            console.log(e)
        })
    },
})
