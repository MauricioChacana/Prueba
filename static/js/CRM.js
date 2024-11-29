/*Carga de Json*/
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayData();
    /*Funciones de filtrado*/    
    document.querySelectorAll('.tag').forEach(button => {
        button.addEventListener('click', () => {
            const criteria = button.getAttribute('data-sort');
            console.log('Sorting by:', criteria);
            sortTable(criteria);
        });
    });

    document.querySelectorAll('.send-email-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const email = event.target.getAttribute('data-email');
            if (email) {
                console.log(`Enviar correo a: ${email}`);
                sendEmail(email);
            } else {
                console.error('No se pudo obtener el correo electrónico');
            }
        });
    });

    document.getElementById('filter-school-btn').addEventListener('click', () => {
        filterBySchool();
    });

    document.querySelector('.btn-container .btn:nth-child(2)').addEventListener('click', () => {
        sendBulkEmails();
    });
     // Añadir evento al botón de generar Excel
    // Añadir evento al botón de generar Excel
    document.querySelector('.btn-generar-excel').addEventListener('click', function(event) {
        event.preventDefault();
        generarExcelDesdeDatos();
    });
});

let myChart; // Variable global para mantener la referencia al gráfico

function fetchAndDisplayData() {
    fetch('/obtener-datos-cuestionario/')
        .then(response => response.json())
        .then(data => {
            window.tableData = data; // Guarda los datos en una variable global
            displayTable(data);
            createGraph(data);
        })
        .catch(error => console.error('Error al obtener los datos:', error));
}

function displayTable(data) {
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = ''; // Limpia la tabla antes de agregar nuevas filas

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.rut}</td>
            <td>+56${item.telefono}</td>
            <td class="${item.puntaje < 50 ? 'low-score' : ''}">${item.puntaje}%</td>
            <td>${item.colegio}</td>
            <td><button class="send-email-btn" data-email="${item.correo}">Enviar correo</button></td>
        `;
        tbody.appendChild(row);
    });

    // Añadir evento de clic a los botones de enviar correo
    document.querySelectorAll('.send-email-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const email = event.target.getAttribute('data-email');
            if (email) {
                console.log(`Enviar correo a: ${email}`);
                sendEmail(email);
            } else {
                console.error('No se pudo obtener el correo electrónico');
            }
        });
    });

    console.log('Table displayed with data:', data);
}

function sendEmail(email) {
    fetch('/send-email-ajax/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')  // Asegúrate de incluir el token CSRF
        },
        body: new URLSearchParams({
            'email': email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Correo enviado con éxito');
        } else {
            alert('Error al enviar el correo');
        }
    })
    .catch(error => console.error('Error:', error));
}

function createGraph(data) {
    const totalAlumnos = data.length;
    const alumnosBajo50 = data.filter(item => item.puntaje < 50).length;
    const porcentajeBajo50 = (alumnosBajo50 / totalAlumnos) * 100;
    const porcentajeSobre50 = 100 - porcentajeBajo50;

    // Destruye el gráfico existente si existe
    if (myChart) {
        myChart.destroy();
    }

    // Crea el gráfico
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Por debajo del 50%', 'Por encima del 50%'],
            datasets: [{
                data: [porcentajeBajo50, porcentajeSobre50],
                backgroundColor: ['#C35138', '#72e31a'],
                hoverBackgroundColor: ['#C35138', '#72e31a'],
                color: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#FFFFFF' // Cambia el color de las etiquetas de la leyenda
                    }
                },
                title: {
                    display: true,
                    text: 'Porcentaje de alumnos con puntajes por debajo del 50%',
                    color: '#FFFFFF'
                }
            }
        }
    });
}

// Función para obtener el token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Filtro de escuelas
const filterBySchool = () => {
    const schoolInput = document.getElementById('school-input').value.toLowerCase();
    if (schoolInput === '') {
        displayTable(window.tableData); // Muestra todos los datos si no hay nada escrito
        createGraph(window.tableData); // Actualiza el gráfico
    } else {
        const filteredData = window.tableData.filter(item => item.colegio.toLowerCase() === schoolInput);
        displayTable(filteredData); // Muestra los datos filtrados
        createGraph(filteredData); // Actualiza el gráfico
    }
    console.log('Table filtered by school:', schoolInput);
}

function generarExcelDesdeDatos() {
    const rows = Array.from(document.querySelectorAll('.data-table tbody tr'));
    const data = rows.map(row => {
        return {
            nombre: row.cells[0].innerText,
            rut: row.cells[1].innerText,
            telefono: row.cells[2].innerText,
            puntaje: row.cells[3].innerText,
            colegio: row.cells[4].innerText
        };
    });

    fetch('/generar-excel-desde-datos/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Excel generado con éxito');
        } else {
            alert('Error al generar el Excel');
        }
    })
    .catch(error => console.error('Error:', error));
}