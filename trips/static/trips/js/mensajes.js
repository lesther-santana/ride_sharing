document.addEventListener("DOMContentLoaded", ready);


function ready() {

    document.getElementById("btn-enviar-mensaje").addEventListener("click", function() {
        enviarMensaje();
    })

    let convos = document.getElementsByClassName("convo");
    convos.forEach(element => {
        element.addEventListener("click", async function (event) {
            let mensajes = await getMensajes(element.dataset.id);
            cleanChat();
            createChat(mensajes);
            mostrarMensajes();
            removeActive();
            this.classList.add("active")
            updateMensajeInput(this.dataset.id);

            //console.log(document.getElementsByClassName("active").length);
        });
       
    });
    
}

function updateMensajeInput(convoId) {
    let mensajeInput = document.getElementById("input-mensaje");
    mensajeInput.dataset.id = convoId;
}

function removeActive() {
    let currentActive = document.getElementsByClassName("active");
    currentActive.forEach(element => {
        element.classList.remove("active")
    })
}

function mostrarMensajes() {
    let tablero = document.getElementById("tablero");
    tablero.style.display = '';
}

async function getMensajes(id) {
    let mensajes;
    await fetch(`convo/${id}`)
    .then(response => response.json())
    .then(data => {
        mensajes = data
    })
    return mensajes
}

function cleanChat() {
    let currentChat = document.getElementById("mensajes")
    if (currentChat.hasChildNodes()) {
        let children = Array.from(currentChat.children);
        children.forEach(child => {
            child.remove()
        })
    }
}

function createBubble(currentUser, data) {

    let card = document.createElement("div");
    card.style.maxWidth = "50%";
    card.style.minWidth = "50%"
    card.classList.add("card","my-1");

    

    let body = document.createElement("div")
    body.classList.add("card-body")

    let texto = document.createElement("p")
    texto.classList.add("card-text","mb-1")
    texto.innerHTML = data.text;

    let user = document.createElement("p")
    user.classList.add("fw-bold", "mb-1");
    user.innerHTML = data.sender;

    let dateSent = document.createElement("small")
    dateSent.classList.add("d-flex", "opacity-50", "text-nowrap", "justify-content-end", "mb-0")
    let parsedDate = new Date(data.date_created)
    dateSent.innerHTML = parsedDate.toLocaleString()

    if (currentUser === data.sender) {
        card.classList.add("align-self-end");
        user.innerHTML = "Yo"
    } else {
        card.classList.add("align-self-start");
    }

    body.append(user, texto, dateSent);
    card.append(body);
    
    return card
}

function createChat(data) {
    let chat = document.getElementById("mensajes");
    let usuario = data.usuario;
    data.mensajes.forEach(mensaje => {
        let bubble = createBubble(usuario, mensaje);
        chat.append(bubble)
    })
}


function enviarMensaje() {
    let inputMensaje = document.getElementById("input-mensaje");
    let texto = inputMensaje.value.trim();
    let convo = inputMensaje.dataset.id;

    if (texto.length > 0) {
        const csrftoken = Cookies.get('csrftoken');
        fetch('/mensajes', {
            method: 'POST',
            mode: 'same-origin',
            headers: {'X-CSRFToken': csrftoken},
            body: JSON.stringify({
                text: texto,
                convo: convo
            })
        })
        .then(response => response.json())
        .then(data => {
            let bubble = createBubble(data.usuario, data.mensajes[0]);
            document.getElementById("mensajes").append(bubble);
            inputMensaje.value = "";
        })
    }
}