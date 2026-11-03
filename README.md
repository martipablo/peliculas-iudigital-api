# API REST de Películas y Series

Proyecto de la **EA1: API REST - NodeJs** de la asignatura Proyecto Integrado II (Ingeniería de Software y Datos, IU Digital de Antioquia).

API REST construida con **Node.js, Express y MongoDB (Mongoose)** para que un administrador gestione el catálogo de una plataforma de entretenimiento de la universidad (una aplicación "tipo Cuevana", con producciones licenciadas). Por ahora no incluye registro de usuarios ni seguridad, tal como lo define el caso de estudio.

## Qué hace el proyecto

Expone cinco módulos, cada uno con su ruta base:

| Módulo | Ruta base | Operaciones |
|---|---|---|
| Género | `/api/generos` | Listar, consultar, crear, editar |
| Director | `/api/directores` | Listar, consultar, crear, editar |
| Productora | `/api/productoras` | Listar, consultar, crear, editar |
| Tipo | `/api/tipos` | Listar, consultar, crear, editar |
| Media (películas y series) | `/api/medias` | Listar, consultar, crear, editar, eliminar |

Los cuatro catálogos no tienen eliminar porque el caso solo pide "registrar y editar": en lugar de borrarse, se desactivan con `estado: "Inactivo"`. Eso evita que una película quede apuntando a un género, director o productora que ya no existe.

## Tecnologías

- Node.js (20.6 o superior, por el uso de `--env-file`)
- Express (servidor y rutas)
- Mongoose (modelos y validaciones)
- MongoDB Atlas (base de datos en la nube)
- cors (permite que el frontend, que será una aplicación aparte, consuma la API)
- Postman (pruebas)

## Instalación y ejecución

1. Instalar las dependencias (una sola vez):
   ```bash
   npm install
   ```
2. Crear el archivo de variables de entorno a partir del ejemplo (una sola vez):
   ```bash
   cp .env.example .env
   ```
3. Editar `.env` con la cadena de conexión de MongoDB Atlas, incluyendo el nombre de la base de datos:
   ```
   PORT=3000
   MONGO_URI=mongodb+srv://USUARIO:CLAVE@cluster0.xxxxx.mongodb.net/peliculas_db
   ```
4. Iniciar el servidor (cada vez que se quiera trabajar):
   ```bash
   npm run dev
   ```
   Si todo está bien, la terminal muestra `MongoDB conectado` y `API en http://localhost:3000`. El modo `dev` reinicia el servidor automáticamente al guardar cambios. Para ejecutar sin reinicio automático se usa `npm start`.

> El archivo `.env` contiene credenciales y está excluido del repositorio mediante `.gitignore`.

## Estructura del proyecto

```
peliculas-api/
├── package.json            Dependencias y scripts (start, dev)
├── .env.example            Plantilla de variables de entorno
├── .env                    Variables reales (no se sube a Git)
├── .gitignore              Excluye node_modules y .env
└── src/
    ├── app.js              Punto de entrada: configura Express, registra las rutas,
    │                       maneja los errores y conecta a la base de datos
    ├── config/
    │   └── db.js           Conexión a MongoDB con Mongoose
    ├── models/
    │   ├── opciones.js     Opciones comunes: fechaCreacion, fechaActualizacion y sin __v
    │   ├── Genero.js       Esquema del módulo Género
    │   ├── Director.js     Esquema del módulo Director
    │   ├── Productora.js   Esquema del módulo Productora
    │   ├── Tipo.js         Esquema del módulo Tipo
    │   └── Media.js        Esquema de películas y series, con referencias a los otros cuatro
    ├── routes/
    │   └── media.js        Rutas y reglas de negocio del módulo Media
    └── utils/
        └── crudRouter.js   Router reutilizable (GET, POST, PUT) que usan los cuatro catálogos
```

## Flujo de una petición

```
Cliente (Postman / futuro frontend)
        │  petición HTTP con JSON
        ▼
   app.js  ──  cors + express.json()  ──►  ruta según la URL (/api/...)
        │
        ▼
  crudRouter.js (catálogos)  o  routes/media.js (Media)
        │   en Media: valida que género, director, productora y tipo existan
        │   y que género, director y productora estén Activos
        ▼
  Modelo de Mongoose  ──  valida los campos (required, enum, unique...)
        │
        ▼
     MongoDB Atlas
        │
        ▼
  Respuesta JSON con el código HTTP correspondiente
  (si algo falla, el manejador de errores de app.js la convierte en 400, 404, 409 o 500)
```

## Modelos de datos

Todos los modelos incluyen `_id`, `fechaCreacion` y `fechaActualizacion`, generados automáticamente.

**Género** (`/api/generos`): `nombre` (obligatorio, único), `estado` (`Activo` o `Inactivo`, por defecto `Activo`), `descripcion`.

**Director** (`/api/directores`): `nombres` (obligatorio), `estado` (`Activo` o `Inactivo`, por defecto `Activo`).

**Productora** (`/api/productoras`): `nombre` (obligatorio, único), `estado` (`Activo` o `Inactivo`, por defecto `Activo`), `slogan`, `descripcion`.

**Tipo** (`/api/tipos`): `nombre` (obligatorio, único), `descripcion`. No tiene estado, porque el caso de estudio no lo pide.

**Media** (`/api/medias`):

| Campo | Detalle |
|---|---|
| `serial` | Obligatorio, único |
| `titulo` | Obligatorio |
| `sinopsis` | Opcional |
| `url` | Obligatorio, único |
| `imagenPortada` | Opcional (URL de la imagen) |
| `anioEstreno` | Obligatorio, número mayor o igual a 1888 |
| `genero` | Obligatorio, `_id` de un Género activo |
| `director` | Obligatorio, `_id` de un Director activo |
| `productora` | Obligatorio, `_id` de una Productora activa |
| `tipo` | Obligatorio, `_id` de un Tipo existente |

## Endpoints

Los cuatro catálogos (`/api/generos`, `/api/directores`, `/api/productoras`, `/api/tipos`) comparten estas operaciones:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/<modulo>` | Lista todos los registros (admite `?estado=Activo` o `?estado=Inactivo`, salvo en Tipo) |
| GET | `/api/<modulo>/:id` | Consulta un registro por su `_id` |
| POST | `/api/<modulo>` | Crea un registro |
| PUT | `/api/<modulo>/:id` | Edita un registro (basta con enviar los campos a cambiar) |

Media:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/medias` | Lista las producciones con los datos de género, director, productora y tipo. Filtros opcionales: `?genero=ID`, `?director=ID`, `?productora=ID`, `?tipo=ID` |
| GET | `/api/medias/:id` | Consulta una producción |
| POST | `/api/medias` | Crea una producción |
| PUT | `/api/medias/:id` | Edita una producción (solo se validan las relaciones que se envíen) |
| DELETE | `/api/medias/:id` | Elimina una producción |

### Ejemplos

Crear un género: `POST /api/generos`
```json
{ "nombre": "Acción", "descripcion": "Películas de acción" }
```

Crear una producción: `POST /api/medias`
```json
{
  "serial": "MED-001",
  "titulo": "Título de ejemplo",
  "sinopsis": "Sinopsis de ejemplo",
  "url": "https://ejemplo.com/pelicula-001",
  "imagenPortada": "https://ejemplo.com/portada.jpg",
  "anioEstreno": 2010,
  "genero": "ID_DEL_GENERO",
  "director": "ID_DEL_DIRECTOR",
  "productora": "ID_DE_LA_PRODUCTORA",
  "tipo": "ID_DEL_TIPO"
}
```

## Reglas de negocio

- Una producción pertenece a un único género, un único director principal, una única productora y un único tipo.
- Al crear o editar una producción, el género, el director y la productora deben existir y estar en estado `Activo`. El tipo solo debe existir.
- El `serial` y la `url` de una producción no pueden repetirse.
- Solo se aceptan los campos definidos en cada módulo; las fechas las asigna el sistema y no se pueden modificar desde la petición.

## Códigos de respuesta

| Código | Cuándo ocurre |
|---|---|
| 200 | Consulta, edición o eliminación exitosa |
| 201 | Registro creado |
| 400 | Datos inválidos (campo obligatorio faltante, valor no permitido, ID mal formado, género/director/productora inactivo o inexistente) |
| 404 | No existe un registro con ese `_id` |
| 409 | Valor duplicado en un campo único (nombre, serial o url) |
| 500 | Error interno del servidor |

## Pruebas con Postman

Las pruebas se hacen con Postman. La colección `EA1_API_Peliculas.postman_collection.json` se importa desde **File > Import** y tiene una carpeta por módulo. Se ejecuta en orden, de arriba hacia abajo, con el servidor encendido: los POST guardan automáticamente los `_id` creados en variables de la colección, y las peticiones siguientes los reutilizan. Incluye dos pruebas de error intencionales: crear una producción con un género inactivo (400) y repetir una producción con serial y URL ya existentes (409).

## Alcance actual y siguientes pasos

Esta entrega corresponde al backend (API y base de datos). Quedan fuera por ahora, según el caso de estudio: autenticación y roles, el frontend (que será una aplicación separada de este servicio) y el despliegue.
