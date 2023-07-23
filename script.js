// Código creado por Fernando Bruno - Comisión 52235

// Función para utilizar fetch y obtener mi lista de productos desde mi archivo local .json
async function obtenerStock (){
  try{
    let response = await fetch('./stock.json')
    let data =  await response.json()
    arranque(data) // una vez obtenida la lista, la envio a la funcion arranque
}
catch(err){ // En caso de que no encuentre la lista o haya un error
    console.log('Sucedio un error en la consulta')
}
}

obtenerStock() 


// Función principal del programa, con mi lista ya levantada y la creación de las tarjetas y carrito
function arranque(productos) {


  // si hay algo en la memoria local previamente, lo guardo en carritoJSON
  let carritoJSON = JSON.parse(localStorage.getItem("carrito"))
  // si ya hay elementos guardados en la memoria, lo pusheo al carrito, si no, creo un carrito vacio
  let carrito = carritoJSON ? carritoJSON : []

  let contenedorFiltros = document.getElementById("filtros")  // busco el div "filtros" y lo guardo en una variable

  let buscador = document.getElementById("buscador")  // hago lo mismo con mi input, lo guardo en una variable
  // si se ingresa algo en el input "buscador", llama la funcion filtrar y le envio mi lista de productos total
  buscador.addEventListener("input", () => filtrar(productos, carrito))
  crearFiltros(productos, contenedorFiltros, carrito)  // llamada a las funciones generales de la página
  crearTarjetas(productos, carrito)
  renderizarCarrito(carrito)
  let botonMenorMayor = document.getElementById("precioMenorMayor")
  botonMenorMayor.addEventListener("click", () => filtrarMenorMayor(productos, carrito))
  let botonMayorMenor = document.getElementById("precioMayorMenor")
  botonMayorMenor.addEventListener("click", () => filtrarMayorMenor(productos, carrito))
  let botonFinalizarCompra = document.getElementById("finalizarCompra")
  botonFinalizarCompra.addEventListener("click", () => finalizarCompra(carrito))
  let botonCarrito = document.getElementById("botonCarrito")
  botonCarrito.addEventListener("click", mostrarOcultar)

}

// llamo a la funcion para que arranque mi pagina
arranque()

// funcion para crear las tarjetas de los productos a mostrar (sean todos o filtrados previamente en otra función)
function crearTarjetas(array, carrito) {
  let contenedor = document.getElementById("productos") // busco mi div productos en el html
  contenedor.innerHTML = "" // vacio el contenedor
  array.forEach(({ id, nombre, artista, rutaImagen, precio }) => { // para cada elemento que encuentra, crea un div con una clase
    let producto = document.createElement("div")
    producto.className = "tarjetaProducto"
    // después en mi div creado, le agrego un titulo, una imagen y el precio de cada producto encontrado
    producto.innerHTML = `
      <h4>${nombre + " - " + artista}</h4>
      <img class="imagen" src="img/${rutaImagen}">
      <h4>$${precio}</h4>
      <button id="agregar-${id}" class="botones">Agregar al carrito</button>
    `
    contenedor.appendChild(producto) // acá ya está creado mi tarjeta en la página
    let botonAgregarAlCarrito = document.getElementById(`agregar-${id}`)
    botonAgregarAlCarrito.addEventListener("click", () => agregarAlCarrito(array, id, carrito))
    producto.addEventListener("mouseenter", () => // este event como el de abajo es para la animación de las tarjetas de compra
      producto.classList.add("agrandado")
    )

    producto.addEventListener("mouseleave", () =>
      producto.classList.remove("agrandado")
    )
  })
}


// ELEMENTOS FILTRADORES (BUSCADOR Y BOTONES)


// filtrar elementos en base al input "buscador"
function filtrar(elementos, carrito) { // cuando filtro paso todo a minuscula para evitar errores
  let arrayFiltrado = elementos.filter(producto => producto.nombre.toLowerCase().includes(buscador.value.toLowerCase()) || producto.artista.toLowerCase().includes(buscador.value.toLowerCase()))
  if (arrayFiltrado.length === 0) { // en caso de que no encuentre ninguna coincidencia
    let pantallaError = document.getElementById("productos")
    pantallaError.innerHTML = ""
    pantallaError.className = "mensajeError"
    pantallaError.innerHTML = `<h2> Ups! Parece que no lo tenemos! </h2>
    <img class="imagen" src="img/error.png">
    `
  } else {
    crearTarjetas(arrayFiltrado, carrito) // creo las tarjetas de los productos en base a la filtracion previa
  }
}


// busco los géneros en mi stock y creo un boton con ese nombre para filtrar
function crearFiltros(arrayDeElementos, contenedorFiltros, carrito) {
  let filtros = ["todos"]
  arrayDeElementos.forEach(producto => {
    if (!filtros.includes(producto.categoria)) { // si 
      filtros.push(producto.categoria)
    }
  })

  filtros.forEach(filtro => { // para cada filtro encontrado en mi array creo un nuevo botón
    /* let boton = document.createElement("button")
    boton.id = filtro
    boton.innerText = filtro */
    var liElemento = document.createElement("li");
    var aElemento = document.createElement("a");
    aElemento.className = "dropdown-item";
    aElemento.id = filtro
    aElemento.href = '#';
    aElemento.innerText = filtro
    liElemento.appendChild(aElemento);
    contenedorFiltros.appendChild(liElemento)
    let botonCapturado = document.getElementById(filtro)
    botonCapturado.addEventListener("click", (e) => filtrarPorCategoria(e.target.id, arrayDeElementos, carrito))
  })
}

// si el id es "todos", muestra todos los productos, si no, muestra solamente por el genero seleccionado
function filtrarPorCategoria(id, productos, carrito) {
  if (id === "todos") {
    crearTarjetas(productos, carrito)
  } else {
    let elementosFiltrados = productos.filter(producto => producto.categoria === id)
    crearTarjetas(elementosFiltrados, carrito)
  }
}

// funcion para ordenar las tarjetas de menor precio a mayor
function filtrarMenorMayor(productos, carrito) {
  let copiaParaOrdenar = productos.slice() // hago una copia para no modificar mi lista original
  let copiaFinal
  copiaFinal = copiaParaOrdenar.sort((a, b) => a.precio - b.precio)
  crearTarjetas(copiaFinal, carrito)
}

// funcion para ordenar las tarjetas de mayor precio a menor
function filtrarMayorMenor(productos, carrito) {
  let copiaParaOrdenar = productos.slice() // hago una copia para no modificar mi lista original
  let copiaFinal
  copiaFinal = copiaParaOrdenar.sort((a, b) => b.precio - a.precio)
  crearTarjetas(copiaFinal, carrito)
}



// SECCIÓN CARRITO DE COMPRAS



// funcion para que oculte mis productos y solo muestre la lista del carrito, si se vuelve a llamar, hará lo contrario
function mostrarOcultar() {
  let vistaProductos = document.getElementById("productos")
  let carritoLista = document.getElementById("seccionCarrito")
  vistaProductos.classList.toggle("oculto")// toggle cambia como un switch 
  carritoLista.classList.toggle("oculto")// toggle cambia como un switch 
  cambiarMensaje()
}

function cambiarMensaje(){
  let botonCarrito = document.getElementById("botonCarrito")
  let mensajeActual = botonCarrito.innerHTML
  let nuevoMensaje = mensajeActual === 'Carrito' ? 'Ver productos' : 'Carrito'
  botonCarrito.innerHTML = nuevoMensaje
}

// funcion para guardar elementos en mi carrito
function agregarAlCarrito(productos, id, carrito) {
  let productoBuscado = productos.find(producto => producto.id === id)
  let posicion = carrito.findIndex(prod => prod.id === productoBuscado.id)
  if (posicion === -1) { // si ve que no hay coincidencia, es que en el carrito no existe
    carrito.push({
      id: productoBuscado.id,
      nombre: productoBuscado.nombre,
      precio: productoBuscado.precio,
      unidades: 1,
      subtotal: productoBuscado.precio,
      imagen: productoBuscado.rutaImagen
    })
    mostrarMensaje("Producto agregado al carrito!", "green") //llamada a la función que utiliza toastify
  } else { // si no es -1, significa que ya se agregó previamente
    let stockActual = productoBuscado.stock
    if (stockActual > carrito[posicion].unidades) { // chequeo de que haya stock disponible antes de agregar otra unidad al carrito
      carrito[posicion].unidades++
      carrito[posicion].subtotal = carrito[posicion].precio * carrito[posicion].unidades
      mostrarMensaje("Producto agregado al carrito!", "green")
    } else { // en caso de pasarse, cambio el boton de agregar a "fuera de stock" y no sumo más al carrito
      mostrarMensaje("No se puede agregar más de ese producto!", "red")
    }
  }
  renderizarCarrito(carrito)
  localStorage.setItem("carrito", JSON.stringify(carrito))

}



// funcion para mostrar en la página los elementos guardados en mi carrito
function renderizarCarrito(carrito) {
  let carritoFisico = document.getElementById("carrito")
  carritoFisico.innerHTML = ""
  let verPrecioFinal = document.getElementById("mostrarPrecioFinal")
  if (carrito.length !== 0) {
    carrito.forEach(({ id, nombre, unidades, subtotal, imagen }) => {
      carritoFisico.innerHTML += `
        <img class="imagenCarrito" src="img/${imagen}">
        <span>${nombre} </span>
        <span>${unidades} </span>
        <span>${subtotal}</span>
        <button class="botones" data-id="${id}">Eliminar Producto</button>
      `
    })
    let precioFinal = carrito.reduce((total, producto) => {
      return total + (producto.precio * producto.unidades)
    }, 0)
    verPrecioFinal.innerHTML = `<h3>El precio final a pagar es de: ${"$" + precioFinal}</h3>`
    let botonesBorrarProducto = document.querySelectorAll("#carrito .botones")
    botonesBorrarProducto.forEach(boton => {
      boton.addEventListener("click", () => {
        let idProducto = boton.getAttribute("data-id")
        borrarProducto(carrito, idProducto)
      })
    })
  } else { // en caso de que no haya nada en el carrito aún
    verPrecioFinal.innerHTML = ""
    carritoFisico.innerHTML = "<h2> El carrito está vacío!</h2>"
  }
}


// si se clickea el boton de eliminar producto, puedo eliminar ese producto en específico del carrito
function borrarProducto(carrito, id) {
  let productoAEliminar = carrito.findIndex(producto => producto.id === Number(id))
  if (productoAEliminar !== -1) {
    carrito.splice(productoAEliminar, 1)
  }
  localStorage.setItem("carrito", JSON.stringify(carrito))
  mostrarMensaje("Producto eliminado del carrito!", "#5E97F9") 
  renderizarCarrito(carrito)
}


// si se presiona el boton de finalizar compra
function finalizarCompra(carrito) {
  if (carrito.length !== 0) { // si el carrito tiene algo, limpio el carrito y lo que esté guardado en el localStorage
    let carritoFisico = document.getElementById("carrito")
    carritoFisico.innerHTML = ""
    localStorage.removeItem("carrito")
    carrito.splice(0, carrito.length)
    Swal.fire({ // codigo utilizando sweetalert2 
      title: 'Compra Finalizada!',
      text: 'Muchas gracias por comprar, vuelva pronto!',
      imageUrl: './img/final.png',
      imageWidth: 300,
      imageHeight: 200,
      imageAlt: 'Custom image',
    })
  } else { // en caso de que se presione y el carrito esta vacio
    Swal.fire({
      title: 'Apa estamos ansiosos!',
      text: 'Primero vas a tener que agregar algo al carrito',
    })
  }
  renderizarCarrito(carrito)
}

// FUNCIONES DE LIBRERIAS

// TOASTIFY
// Recibe el tipo de mensaje y el color para mostrarlo por pantalla por 3 segundos
function mostrarMensaje(mensaje, color) {
  Toastify({
    text: mensaje,
    backgroundColor: color,
    duration: 3000
  }).showToast();
}