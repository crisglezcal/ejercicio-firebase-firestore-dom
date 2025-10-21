/* ⚙️ ESTRUCTURA:
1️⃣PASO 1: CONEXIÓN CON FIREBASE
2️⃣PASO 2: FUNCIONES
3️⃣PASO 3: LOCAL STORAGE
4️⃣PASO 4: EVENT LISTENERS
*/

// ############################################ 1️⃣ PASO 1: CONEXIÓN CON FIREBASE ############################################

// Objeto de configuración de Firebase => Conexión a Firebase
const firebaseConfig = { 
    apiKey: "AIzaSyBs_lheYKONIW7zhYp6hUv9qQ0trbm35ws",
    authDomain: "fir-web-37175.firebaseapp.com",
    projectId: "fir-web-37175",
    storageBucket: "fir-web-37175.firebasestorage.app",
    messagingSenderId: "106997965105",
    appId: "1:106997965105:web:66f4f7d5e5189ef2b19010"
};

// Inicializa la app Firebase
firebase.initializeApp(firebaseConfig);

// Objeto que representa la BBDD
const db = firebase.firestore();

// Variable global para controlar la edición (sirve para controlar qué usuario se está editando en cada momento)
let editingUserId = null;


// ################################################## 2️⃣PASO 2: FUNCIONES ##################################################

// ====================================================== CREAR USUARIO ======================================================

// 1. Recibe los datos del usuario para crearlo
const createUser = (user) => {
  // 2. En la base de datos busca la carpeta "contact-users" y agrega un nuevo usuario
  db.collection("contact-users")
    .add(user)
    // 3. Firebase devuelve un ID único del usuario que se acaba de crear y lo muestra en consola
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      // 4. Actualiza la pantalla para mostrar todos los usuarios incluyendo el nuevo llamando a la función "readAllUsers()"
      readAllUsers(); 
    })
    // 5. Si algo sale mal, muestra el error en la consola
    .catch((error) => console.error("Error adding document: ", error));
};

// ====================================================== MOSTRAR TODOS LOS USUARIOS Y PINTARLOS EN EL DOM ======================================================

// 1. Función "cleanUsersContainer()"
const cleanUsersContainer = () => {
  const usersElement = document.getElementById("users-element"); // => Busca donde se muestran los usuarios ("users-element")
  if (usersElement) { // => Si lo encuentra, lo vacía
    usersElement.innerHTML = ""; 
  }
};

// 2. Mostrar usuarios en el DOM:
function printUser(name, email, mensaje, url, userId) {
    const usersElement = document.getElementById("users-element"); // => Recibe los datos de un usuario
    const userDiv = document.createElement('div'); // => Busca dónde mostrarlo
    userDiv.className = 'user-item'; // => Crea una caja para este usuario
    userDiv.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong> ${mensaje || "Sin mensaje"}</p>
        ${url ? `<img src="${url}" alt="${name}" class="user-image">` : ''}
        <div class="user-actions">
            <button onclick="editUser('${userId}')">Editar</button>
            <button onclick="deleteUser('${userId}')">Eliminar</button>
        </div>
    `;

    usersElement.appendChild(userDiv); // => Añado la caja al lugar donde van todos los usuarios ("users-element")
}

// 3. Función "readAllUsers()"
const readAllUsers = () => {
    cleanUsersContainer(); // => Primero limpia la pantalla
    console.log("Leyendo usuarios de Firebase...");

    db.collection("contact-users") // => Le pide a Firebase que le de todos los usuarios de la carpeta "contact-users"
        .get()
        .then((querySnapshot) => {
            console.log("Número de usuarios encontrados:", querySnapshot.size);
            querySnapshot.forEach((doc) => { // => Por cada usuario recibido ejecuta la función "printUser()" para mostrarlo en pantalla
                console.log("Usuario:", doc.data());
                printUser(doc.data().name, doc.data().email, doc.data().mensaje, doc.data().url, doc.id);
            });
        })
        .catch((error) => console.log("Error reading documents:", error));  // => Si algo sale mal, muestra el error
};

// ====================================================== BOTÓN (BORRAR UN USUARIO) ======================================================

function deleteUser(userId) { // => Recibe el ID único del usuario que se quiere eliminar
    const confirmacion = confirm("¿Estás seguro de que quieres eliminar este usuario?"); // => Pregunta de confirmación
    if (confirmacion) { // => Si el usuario confirma...
        db.collection("contact-users").doc(userId).delete() // => Va a la carpeta "contact-users", busca el documento con este "userID" y lo elimina
        .then(() => { // => Muestra una alerta al eliminar al usuario
            alert("Usuario eliminado correctamente");
            readAllUsers(); // => Vuelve a cargar todos los usuarios para actualizar la pantalla
        })
        .catch((error) => {
            console.error("Error eliminando usuario:", error);
            alert("Error al eliminar usuario"); // => Si algo sale mal, muestra el error
        });
    }
}

// ====================================================== BOTÓN (EDITAR UN USUARIO) ======================================================

function editUser(userId) {
    console.log("editUser llamado con ID:", userId);
    
    // Obtener los datos del usuario desde Firebase
    db.collection("contact-users").doc(userId).get()
    .then((doc) => {
        console.log("Documento obtenido:", doc.exists);
        
        // Si existe...
        if (doc.exists) {
            const user = doc.data();
            console.log("Datos del usuario:", user);
            
            // Mostrar datos actuales en el formulario
            document.getElementById("name").value = user.name || "";
            document.getElementById("email").value = user.email || "";
            document.getElementById("short-text").value = user.mensaje || "";
            document.getElementById("url").value = user.url || "";

            // Guardar el ID del usuario que se está editando
            editingUserId = userId; 
            console.log("editingUserId establecido:", editingUserId);
            
            // Cambiar el texto del botón de enviar a "Guardar cambios"
            const submitButton = document.querySelector('input[type="submit"]');
            submitButton.value = "Guardar cambios";
            console.log("Botón cambiado a: Guardar cambios");
            
            // Hacer scroll al formulario para que el usuario lo vea
            document.getElementById("contact-form").scrollIntoView({ behavior: 'smooth' });
        
        // Si no existe...    
        } else {
            console.log("El documento no existe");
            alert("No se encontró el usuario para editar");
        }
    })
    .catch((error) => {
        console.error("Error cargando usuario:", error);
        alert("Error al cargar usuario para editar");
    });
}

// ====================================================== BOTÓN (BORRAR TODOS LOS USUARIOS) ======================================================

function deleteAllUsers() { // => Función para eliminar TODOS los usuarios
    const confirmacion = confirm("¿Estás seguro de que quieres eliminar TODOS los usuarios?"); // => Pregunta de confirmación
    if (confirmacion) { // => Si confirma...
        db.collection("contact-users").get() // => Le pide a Firebase la lista de TODOS los usuarios
        .then((querySnapshot) => {
            const deletePromises = []; // => Crea una lista de tareas pendientes vacía
            querySnapshot.forEach((doc) => { // => Por cada usuario en la lista...
                deletePromises.push(db.collection("contact-users").doc(doc.id).delete()); // => "Borrar usuario 1", "Borrar usuario 2", "Borrar usuario 3"...
            });
            return Promise.all(deletePromises); // => Le dice a Firebase que espere a que se terminen de borrar TODOS los usuarios de la lista antes de continuar
        })
        .then(() => { // => Cuando Firebase termina de borrar todos...
            alert("Todos los usuarios han sido eliminados correctamente"); // => Muestra un mensaje
            cleanUsersContainer(); // => Y limpia la pantalla
        })
        .catch((error) => {
            console.error("Error eliminando usuarios:", error);
            alert("Error al eliminar usuarios");
        });
    }
}

// ############################################ 3️⃣ PASO 3: LOCAL STORAGE ############################################

function clearLocalStorage() { // => Función para limpiar el Local Storage
    localStorage.removeItem("formData");
}

function setupClearButton() { // => Configurar el botón de limpiar formulario

    if (!document.getElementById("cleanAll")) { // => Verificar si el botón ya existe para no duplicarlo

        // Crea el botón para limpiar el formulario
        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.id = "cleanAll";
        clearButton.textContent = "Borrar todo";
        
        // Insertar el botón después del botón de enviar
        const submitButton = document.querySelector('input[type="submit"]');
        submitButton.parentNode.appendChild(clearButton);
        
        // Event listener para el botón de borrar
        clearButton.addEventListener("click", () => {
            document.getElementById("form").reset();
            clearLocalStorage();

            // Restablecer el botón de enviar si estaba en modo edición
            const submitButton = document.querySelector('input[type="submit"]');
            submitButton.value = "Enviar";
            editingUserId = null;
            alert("Formulario limpiado correctamente");
        });
    }
}


// ############################################ 4️⃣ PASO 4: EVENT LISTENERS ############################################

// 1. Espera a que TODA la página termine de cargarse antes de empezar a trabajar
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado, inicializando event listeners...");
    
    // Inicializar Local Storage
    const form = document.getElementById("form"); // => Encuentra el formulario
    const inputs = form.querySelectorAll("input, textarea"); // => Busca todos los campos dentro de ese formulario
    
    // Cargar datos guardados al iniciar
    const savedData = JSON.parse(localStorage.getItem("formData")) || {}; // => Intenta leer lo que hay guardado, lo convierte de vuelta a objeto JS y si no hay nada guardado, usa un objeto vacío
    inputs.forEach(input => { // => Para cada campo del formulario...
        if (savedData[input.id]) { // => Si hay un valor guardado...
            input.value = savedData[input.id]; // => Pon ese valor en el campo
        }
    });
    
    // Guardar datos mientras el usuario escribe
    inputs.forEach(input => { // => Por cada campo del formulario, "escucha" cuando el usuario escribe...
        input.addEventListener("input", () => {
            const formData = {}; // => Crea un objeto vacío para guardar los datos
            inputs.forEach(i => formData[i.id] = i.value); // => Guarda los datos
            localStorage.setItem("formData", JSON.stringify(formData)); // => Convierte el objeto a JSON y lo guarda con la clave "formData"
        });
    });
    
    // Configurar botón de borrar todo (Local Storage)
    setupClearButton();
    
    // Cargar usuarios
    readAllUsers();
    
    // 2. Botón de envío de formulario
    document.getElementById("form").addEventListener("submit", (event) => {
        event.preventDefault();
        
        // Obtiene los valores de los campos del formulario
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const mensaje = document.getElementById("short-text").value;
        const url = document.getElementById("url").value;

        // ¿Se está editando un usuario o creando uno nuevo?
        if (editingUserId) { // => Si "editingUserId" tiene valor está EDITANDO, si no, está CREANDO
            
        // a) Editando un usuario

            // Validaciones antes de guardar: verifica que tenga nombre y email, si no, avisa
            if (!name || !email) {
                alert("Nombre y email son obligatorios");
                return;
            }
            // Validación de email
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                alert("Por favor, introduce un email válido");
                return;
            }
            // Validación de url (si se proporciona)
            if (url) {
                const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlRegex.test(url)) {
                    alert("Por favor, introduce una url válida");
                    return;
                }
            }

            // Le dice a Firebase que actualice el usuario que se está editando con estos nuevos datos
            db.collection("contact-users").doc(editingUserId).update({
                name: name,
                email: email,
                mensaje: mensaje,
                url: url
            })

            // Si sale bien... 
            .then(() => {
                alert("Usuario actualizado correctamente"); // => Actualiza el usuario
                document.getElementById("form").reset(); // => Limpia el formulario
                const submitButton = document.querySelector('input[type="submit"]'); // => Cambia el botón de "Guardar cambios" a "Enviar"
                submitButton.value = "Enviar";
                editingUserId = null; // => Avisa de que ya no se está editando a nadie
                clearLocalStorage(); // => Limpia el Local Storage
                readAllUsers(); // =>  Actualiza la lista de usuarios
            })
            .catch((error) => { // => Si ha habido algún error lo muestra
                console.error("Error actualizando usuario:", error);
                alert("Error al actualizar usuario");
            });
        } else {

        // b) Creando un usuario

            // Validación de nombre
            const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-\:\,\.\!\?\(\)\"\']+$/;
            if (!nameRegex.test(name)) {
                alert("Por favor, introduce un nombre válido");
                return;
            }
            // Validación de email
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                alert("Por favor, introduce un email válido");
                return;
            }

            // Validación de url
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(url)) {
                alert("Por favor, introduce una url válida");
                return;
            }

            // Si pasas todas las validaciones se procesa el formulario
            alert("Formulario enviado correctamente");

            // Crea el usuario
            createUser({
                name: name,
                email: email,
                mensaje: mensaje,
                url: url
            });

            // Limpiar formulario después de enviar
            document.getElementById("form").reset();
            clearLocalStorage(); // => Limpia el Local Storage
        }
    });

    // 3. Botón de borrar TODOS los usuarios
    document.getElementById("delete-all").addEventListener("click", (e) => {
        e.preventDefault();
        deleteAllUsers(); // => Llama a la función "deleteAllUsers()" para que lo borre todo
    });

    console.log("Todos los event listeners inicializados");
});