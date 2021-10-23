/*
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

*/
function showMessages() {
    mensaje = document.getElementById('form-mensaje');
    mensaje.style.display = 'initial';
}

function habilitarBoton() {
    const texto = document.getElementById('mensaje').value;
    const boton = document.getElementById('boton-enviar');
    if (!(texto.trim() === ""))  {
        boton.disabled = false;
    } else {
        boton.disabled ? null : boton.disabled = true
    }
}

function enviarMensaje() {
    const mensaje = document.getElementById("mensaje");
    const id = mensaje.dataset.id;
    const texto = mensaje.value.trim();
    const csrftoken = Cookies.get('csrftoken');

    fetch(`/trip/${id}`, {
        method: 'POST',
        mode: 'same-origin',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({
            texto: texto
        })
    })
    .then(response => {
        window.location.reload();
    })
}