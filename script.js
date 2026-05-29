const API = {
    LOGIN: "/login",
    USERS: "/users",
    PRENDAS: "/prendas"
};

let usuarioAutenticado = false;
let usuarioActual = null;
let armarioVirtual = [];


/* FUNCIÓN PARA MOSTRAR ERRORES*/
const showError = (message) => {
    const zonaErrores = document.getElementById("zona-errores");

    zonaErrores.textContent = message;
    zonaErrores.classList.remove("oculto");

    setTimeout(() => {
        zonaErrores.classList.add("oculto");
        zonaErrores.textContent = "";
    }, 5000);
};


/* LECTURA DE FORMULARIOS*/

function leerFormularioAJSON(formulario) {
    const formData = new FormData(formulario);
    const datosJSON = {};

    for (let [clave, valor] of formData.entries()) {
        datosJSON[clave] = valor;
    }

    return datosJSON;
}


/* CONTROL VISUAL DEL MENÚ TRAS LOGIN */
function activarMenuAutenticado() {
    document.querySelectorAll(".requiere-auth").forEach((elemento) => {
        elemento.classList.remove("oculto");
    });

    document.getElementById("nav-inicio").classList.add("oculto");
    document.getElementById("nav-registro").classList.add("oculto");
}


/* TAREA 2 - LOGIN CON FETCH */
async function procesarLogin(event) {
    event.preventDefault();

    const formulario = event.target;
    const datosLogin = leerFormularioAJSON(formulario);

    try {
        const respuesta = await fetch(API.LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosLogin)
        });

        if (respuesta.status === 200) {
            const datosServidor = await respuesta.json();

            usuarioAutenticado = true;
            usuarioActual = datosServidor;

            activarMenuAutenticado();

            formulario.reset();

            await cargarPrendas();

            cambiarSeccion(5);
        } else if (respuesta.status === 400) {
            showError("Formato incorrecto. Faltan usuario o contraseña.");
        } else if (respuesta.status === 401) {
            showError("Credenciales incorrectas. Comprueba usuario y contraseña.");
        } else {
            showError("Error al iniciar sesión.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en procesarLogin:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}


/* TAREA 3 - REGISTRO DE USUARIOS CON FETCH */
async function procesarRegistro(event) {
    event.preventDefault();

    const formulario = event.target;

    const clave = document.getElementById("reg-pass").value;
    const comprobacionClave = document.getElementById("reg-pass-check").value;

    if (clave !== comprobacionClave) {
        showError("Las contraseñas no coinciden. Por favor, revísalas.");
        return;
    }

    const datosUsuario = leerFormularioAJSON(formulario);
    delete datosUsuario.password_check;

    try {
        const respuesta = await fetch(API.USERS, {/*ve a la url que guarda */
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosUsuario)//convierte el objeto a JSON para enviarlo al servidor
        });

        if (respuesta.status === 201) {
            alert("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
            formulario.reset();
            cambiarSeccion(1);
        } else if (respuesta.status === 400) {
            showError("Faltan campos obligatorios en el registro.");
        } else if (respuesta.status === 403) {
            showError("El usuario ya existe en la base de datos.");
        } else {
            showError("Error al registrar el usuario.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en procesarRegistro:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}


/* NAVEGACIÓN ENTRE SECCIONES */
async function cambiarSeccion(numeroSeccion, datosElemento = null) {
    if (!usuarioAutenticado && (numeroSeccion === 4 || numeroSeccion === 5 || numeroSeccion === 6)) {
        showError("Debes iniciar sesión para acceder a esta sección.");
        numeroSeccion = 1;
    }

    const secciones = document.querySelectorAll(".seccion-spa");
    secciones.forEach((seccion) => seccion.classList.add("oculto"));

    const enlaces = document.querySelectorAll("#menu-principal a");
    enlaces.forEach((enlace) => enlace.classList.remove("activo"));

    let idSeccion = "";
    let idEnlace = "";

    switch (numeroSeccion) {
        case 1:
            idSeccion = "inicio";
            idEnlace = "nav-inicio";
            break;
        case 2:
            idSeccion = "registro";
            idEnlace = "nav-registro";
            break;
        case 3:
            idSeccion = "acerca";
            idEnlace = "nav-acerca";
            break;
        case 4:
            idSeccion = "crear-prenda";
            idEnlace = "nav-crear-prenda";
            break;
        case 5:
            idSeccion = "listar-prendas";
            idEnlace = "nav-listar-prendas";
            break;
        case 6:
            idSeccion = "modificar-prenda";
            idEnlace = "nav-modificar-prenda";
            break;
        default:
            idSeccion = "inicio";
            idEnlace = "nav-inicio";
    }

    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.classList.remove("oculto");
    }

    const enlaceActivo = document.getElementById(idEnlace);
    if (enlaceActivo) {
        enlaceActivo.classList.add("activo");
    }

    if (numeroSeccion === 5 && usuarioAutenticado) {
        await cargarPrendas();
    }

    if (numeroSeccion === 6 && datosElemento) {
        document.getElementById("mod-id").value = datosElemento._id;
        document.getElementById("mod-nombre").value = datosElemento.nombre;
        document.getElementById("mod-tipo").value = datosElemento.tipo;
        document.getElementById("mod-material").value = datosElemento.material;
    }
}


/* TAREA 4 - OBTENER LISTA DE PRENDAS CON FETCH */
async function cargarPrendas() {
    try {
        const respuesta = await fetch(API.PRENDAS);//realiza la consulta al servidor para obtener el listado de prendas

        if (respuesta.status === 200) {
            armarioVirtual = await respuesta.json();//almacena el resultado de la consulta en el array local
            actualizarListado();
        } else {
            showError("No se pudo obtener el listado de prendas.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en cargarPrendas:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}


/* TAREA 4 - PINTAR LISTADO EN EL DOM */
function actualizarListado() {
    const contenedor = document.getElementById("contenedor-listado");//selecciona el contenedor donde se mostrarán las prendas

    contenedor.innerHTML = "";//limpia el contenedor antes de pintar el nuevo listado

    if (armarioVirtual.length === 0) {
        contenedor.innerHTML = "<p>Tu armario virtual está vacío. Añade prendas para empezar.</p>";
        return;
    }

    armarioVirtual.forEach((prenda) => {//recorre el array de prendas y crea una tarjeta para cada una, añadiéndola al contenedor
        const tarjeta = crearTarjetaPrenda(prenda);
        contenedor.appendChild(tarjeta);
    });
}

function crearTarjetaPrenda(prenda) {
    const tarjeta = document.createElement("div");

    tarjeta.className = "tarjeta-prenda";

/* Asignar a cada tarjeta el _id del elemento */
    tarjeta.id = prenda._id;

    const info = document.createElement("div");
    info.className = "info-prenda";

    info.innerHTML = `
        <h4>${prenda.nombre}</h4>
        <p><strong>Tipo:</strong> ${prenda.tipo}</p>
        <p><strong>Material:</strong> ${prenda.material}</p>
    `;

    const acciones = document.createElement("div");
    acciones.className = "acciones-prenda";

    const botonVer = document.createElement("button");
    botonVer.textContent = "Ver";
    botonVer.addEventListener("click", () => verDetallePrenda(prenda._id));

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => prepararEdicion(prenda));

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => borrarPrenda(prenda._id));

    acciones.appendChild(botonVer);
    acciones.appendChild(botonEditar);
    acciones.appendChild(botonEliminar);

    tarjeta.appendChild(info);
    tarjeta.appendChild(acciones);

    return tarjeta;
}


/* TAREA 5 - VER DETALLE DE UNA PRENDA CON FETCH */
async function verDetallePrenda(id) {
    try {
        const respuesta = await fetch(`${API.PRENDAS}/${id}`);//realiza la consulta al servidor para obtener el detalle de la prenda con el id especificado

        if (respuesta.status === 200) {
            const prenda = await respuesta.json();
            mostrarDialogoDetalle(prenda);
        } else if (respuesta.status === 404) {
            showError("La prenda no existe.");
        } else if (respuesta.status === 400) {
            showError("El identificador de la prenda no tiene formato válido.");
        } else {
            showError("Error al obtener el detalle de la prenda.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en verDetallePrenda:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}

function mostrarDialogoDetalle(prenda) {
    let dialogo = document.getElementById("dialogo-detalle-prenda");

    if (!dialogo) {
        dialogo = document.createElement("dialog");
        dialogo.id = "dialogo-detalle-prenda";
        document.body.appendChild(dialogo);
    }

    dialogo.innerHTML = `
        <h3>Detalle de la prenda</h3>
        <p><strong>ID:</strong> ${prenda._id}</p>
        <p><strong>Nombre:</strong> ${prenda.nombre}</p>
        <p><strong>Tipo:</strong> ${prenda.tipo}</p>
        <p><strong>Material:</strong> ${prenda.material}</p>
        <button id="cerrar-dialogo-detalle">Cerrar</button>
    `;

    const botonCerrar = dialogo.querySelector("#cerrar-dialogo-detalle");
    botonCerrar.addEventListener("click", () => dialogo.close());

    if (typeof dialogo.showModal === "function") {
        dialogo.showModal();
    } else {
        alert(
            `Detalle de la prenda:\n\n` +
            `ID: ${prenda._id}\n` +
            `Nombre: ${prenda.nombre}\n` +
            `Tipo: ${prenda.tipo}\n` +
            `Material: ${prenda.material}`
        );
    }
}


/* TAREA 6 - BORRAR PRENDA CON FETCH */
async function borrarPrenda(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta prenda?");

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(`${API.PRENDAS}/${id}`, {//realiza la consulta al servidor para eliminar la prenda con el id especificado
            method: "DELETE"
        });

        if (respuesta.status === 200) {
            const tarjeta = document.getElementById(id);

            if (tarjeta) {
                tarjeta.remove();//elimina la tarjeta de la prenda del DOM para actualizar el listado visualmente sin necesidad de recargar toda la lista desde el servidor
            }

            await cargarPrendas();
        } else if (respuesta.status === 404) {
            showError("La prenda no existe o ya fue eliminada.");
        } else if (respuesta.status === 400) {
            showError("El identificador de la prenda no tiene formato válido.");
        } else {
            showError("Error al eliminar la prenda.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en borrarPrenda:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}


/* TAREA 7 - CREAR PRENDA CON FETCH */
async function procesarCreacion(event) {
    event.preventDefault();

    const formulario = event.target;//selecciona el formulario que se ha enviado para crear una nueva prenda
    const nuevaPrenda = leerFormularioAJSON(formulario);//convierte los datos del formulario en un objeto JSON con las propiedades nombre, tipo y material, que son las que el servidor espera para crear una nueva prenda

    try {
        const respuesta = await fetch(API.PRENDAS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevaPrenda)//convierte el objeto nuevaPrenda a JSON para enviarlo al servidor en el cuerpo de la petición
        });

        if (respuesta.status === 201) {
            formulario.reset();
            await cargarPrendas();
            cambiarSeccion(5);
        } else if (respuesta.status === 400) {
            showError("Faltan campos obligatorios para crear la prenda.");
        } else {
            showError("Error al crear la prenda.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en procesarCreacion:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}


/* TAREA 7 - PREPARAR EDICIÓN */
function prepararEdicion(prenda) {
    cambiarSeccion(6, prenda);
}


/* TAREA 7 - ACTUALIZAR PRENDA CON FETCH */   
async function procesarModificacion(event) {//procesa el formulario de modificación de una prenda existente, enviando los datos actualizados al servidor mediante una petición PUT a la ruta /prendas/:id, donde :id es el identificador de la prenda que se quiere modificar
    event.preventDefault();//evita que el formulario se envíe de forma tradicional, lo que recargaría la página y perdería el estado actual

    const formulario = event.target;//selecciona el formulario que se ha enviado para modificar una prenda existente
    const datosFormulario = leerFormularioAJSON(formulario);

    const id = datosFormulario.id;//obtiene el identificador de la prenda que se quiere modificar a partir del campo oculto "id" del formulario, que se rellenó previamente al preparar la edición con los datos de la prenda seleccionada

    const prendaModificada = {
        nombre: datosFormulario.nombre,//crea un nuevo objeto prendaModificada con las propiedades nombre, tipo y material, que son las que el servidor espera para actualizar una prenda existente, asignándoles los valores correspondientes del formulario   
        tipo: datosFormulario.tipo,
        material: datosFormulario.material
    };

    try {
        const respuesta = await fetch(`${API.PRENDAS}/${id}`, {//realiza la consulta al servidor para actualizar la prenda con el id especificado, enviando el objeto prendaModificada en el cuerpo de la petición como JSON
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(prendaModificada)
        });

        if (respuesta.status === 200) {
            formulario.reset();
            await cargarPrendas();
            cambiarSeccion(5);
        } else if (respuesta.status === 400) {
            showError("Datos incorrectos para modificar la prenda.");
        } else if (respuesta.status === 404) {
            showError("No existe la prenda que quieres modificar.");
        } else {
            showError("Error al modificar la prenda.");
        }
    } catch (error) {
        console.error("[FRONT-END] Error en procesarModificacion:", error);
        showError("No se ha podido conectar con el servidor.");
    }
}

window.onload = () => {
    cambiarSeccion(1);
};