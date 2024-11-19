/*Carga de Json*/
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayTable();

    /*Funciones de filtrado*/    
    document.querySelectorAll('.tag').forEach(button => {
        button.addEventListener('click', () => {
            const criteria = button.getAttribute('data-sort');
            console.log('Sorting by:', criteria);
            sortTable(criteria);
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

function fetchAndDisplayTable() {
    fetch('/obtener-datos-cuestionario/')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('.data-table tbody');
            tbody.innerHTML = ''; // Limpiar el contenido existente
            window.tableData = data; // Store data in window.tableData
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.nombre}</td>
                    <td>${item.rut}</td>
                    <td>+56${item.telefono}</td>
                    <td class="${item.puntaje < 50 ? 'low-score' : ''}">${item.puntaje}%</td>
                    <td>${item.colegio}</td>
                    <td><button class="send-email-btn">Enviar correo</button></td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error al obtener los datos:', error));
}

function sortTable(sortType) {
    const tbody = document.querySelector('.data-table tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    let compareFunction;
    switch (sortType) {
        case 'lowScore':
            compareFunction = (a, b) => parseInt(a.cells[3].innerText) - parseInt(b.cells[3].innerText);
            break;
        case 'highScore':
            compareFunction = (a, b) => parseInt(b.cells[3].innerText) - parseInt(a.cells[3].innerText);
            break;
        case 'lowSchool':
            compareFunction = (a, b) => a.cells[4].innerText.localeCompare(b.cells[44].innerText);
            break;
        default:
            return;
    }

    rows.sort(compareFunction);

    // Limpiar el contenido existente y añadir las filas ordenadas
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

/*Mostrar la tabla*/
    
const displayTable = (data) => {
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = ''; // Limpiar el contenido existente
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.rut}</td>
            <td>+56${item.telefono}</td>
            <td class="${item.puntaje < 50 ? 'low-score' : ''}">${item.puntaje}%</td>
            <td>${item.colegio}</td>
            <td><button type="button" class="send-email-btn" data-email="${item.correo}">Enviar correo</button></td>
        `;
        tbody.appendChild(row);
    });
    console.log('Table displayed with data:', data);

    // añadir funcion de mandar correo
    document.querySelectorAll('.send-email-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const email = event.target.getAttribute('data-email');
            console.log(`Enviar correo a: ${email}`);
            sendEmail(email);
        });
    });
}


//funcion de enviar correo alerta
const sendEmail = (email) => {
    alert(`Enviando correo a: ${email}`);
    // Aquí puedes agregar la lógica para enviar el correo
}


//funcion de enviar correos a todos los estudiantes con puntaje menor a 50 
const sendBulkEmails = () => {
    const emails = window.tableData
        .filter(item => item.puntaje <= 50)
        .map(item => item.correo);

    if (emails.length > 0) {
        alert(`Enviando correos a: ${emails.join(', ')}`);
        // Aquí puedes agregar la lógica para enviar los correos
    } else {
        alert('No hay estudiantes con puntaje de 50 o menos.');
    }
}

//filtro de escuelas
const filterBySchool = () => {
    const schoolInput = document.getElementById('school-input').value.toLowerCase();
    if (schoolInput === '') {
        displayTable(window.tableData); // Muestra todos los datos si no hay nada escrito
    } else {
        const filteredData = window.tableData.filter(item => item.colegio.toLowerCase() === schoolInput);
        displayTable(filteredData);
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
    .then(response => {
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error('Error al generar el archivo Excel');
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ReporteBecaFacil.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => console.error('Error:', error));
}

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