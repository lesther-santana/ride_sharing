var app = new Vue({
    el: '#app',
    data: {
        year: null,
        make: null,
        model: null,
    }
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
            libraries: ["places"],
            language: 'es'
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