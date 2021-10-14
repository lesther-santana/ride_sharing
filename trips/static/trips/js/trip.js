
var app = new Vue({
    el: '#app',
    data: {
    },
    methods: {
        deleteTrip: function(id, url) {
            const csrftoken = Cookies.get('csrftoken');
            fetch(`/trip/${id}`, {
                method: 'DELETE',
                mode: 'same-origin',
                headers: {'X-CSRFToken': csrftoken},
                body: JSON.stringify({
                    id: id
                })
            })
            .then(response => {
                
                if (response.ok) {
                    window.location.replace('/my-trips')
                    console.log(window.location.url)
                }
            })
        }
    }
})