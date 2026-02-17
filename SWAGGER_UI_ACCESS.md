# 📚 Swagger UI - Acceso a la Documentación de la API

## 🚀 ¿Qué es Swagger UI?

Swagger UI es una interfaz interactiva que te permite:

- 🔍 Explorar todos los endpoints disponibles de la API
- 🧪 Probar endpoints directamente desde el navegador
- 📖 Ver descripciones detalladas de cada endpoint
- 📋 Revisar esquemas de solicitud y respuesta
- 🔐 Autenticarte con JWT

## 📍 URL de Acceso

```
http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger-ui
```

## 🔧 Pasos para Acceder

### 1. Iniciar el Emulador

```bash
cd backend/functions
firebase emulators:start --only functions
```

Deberías ver:

```
✅ Swagger UI endpoints registered
```

### 2. Abrir Swagger UI

Abre tu navegador y ve a:

```
http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger-ui
```

¡Verás la interfaz interactiva de Swagger UI! 🎉

## 📌 Endpoints Disponibles

| Endpoint          | Descripción                               |
| ----------------- | ----------------------------------------- |
| `/swagger-ui`     | 🖥️ Interfaz interactiva de Swagger        |
| `/swagger.json`   | 📄 Especificación OpenAPI 3.0 en JSON     |
| `/swagger-health` | ✅ Verificar que Swagger está funcionando |

## 🔐 Cómo Autenticarse

1. **Abre Swagger UI** (ver URL arriba)
2. **Haz clic en "Authorize"** (botón verde arriba a la derecha)
3. **Pega tu JWT token:**
   - Primero registra/inicia sesión en la API para obtener un token
   - Luego cópialo en el campo de autorización
4. **Haz clic en "Authorize"**
5. **Ahora todos los endpoints protegidos funcionarán** ✅

## 🧪 Cómo Probar Endpoints

### Ejemplo: Obtener tu Perfil

1. Busca la sección **"Authentication"**
2. Haz clic en **"GET /auth/me"**
3. Haz clic en **"Try it out"**
4. Haz clic en **"Execute"**
5. ¡Verás la respuesta abajo! 👇

### Ejemplo: Crear un Post

1. Busca la sección **"Posts"**
2. Haz clic en **"POST /posts"**
3. Haz clic en **"Try it out"**
4. Escribe en el cuerpo de la solicitud:

```json
{
  "content": "¡Mi primer post con Swagger!",
  "image": "https://example.com/image.jpg"
}
```

5. Haz clic en **"Execute"**
6. ¡Tu post se crea! 📝

## 🏷️ Categorías de Endpoints

Los endpoints están organizados por tags:

- **Authentication** - Registro, login, logout
- **Users** - Gestión de perfiles de usuario
- **Hobbies** - Gestión de intereses/hobbies
- **Groups** - Crear y gestionar grupos
- **Chat** - Mensajería entre usuarios
- **Friends** - Gestión de amigos
- **Posts** - Crear y compartir posts
- **Bookings** - Reservar espacios/facilidades
- **Centers** - Información de centros recreativos
- **Contacts** - Gestión de contactos
- **Maps** - Ubicación y mapas
- **Admin** - Operaciones administrativas
- **GroupRequests** - Solicitudes para unirse a grupos

## 📚 Ver Esquemas de Datos

Al final de la página de Swagger UI, desplázate hacia abajo para ver:

- **Schemas** - Todos los modelos de datos disponibles
- Campos requeridos y tipos
- Ejemplos de datos

## 🔗 Enlaces Útiles

- [Documentación Completa de Swagger](backend/SWAGGER_DOCUMENTATION.md)
- [Guía Rápida de Swagger](backend/SWAGGER_QUICK_START.md)

## ❓ Solución de Problemas

### "Not Found" al acceder a Swagger UI

- Verifica que el emulador está corriendo: `firebase emulators:start --only functions`
- Usa la URL correcta: `http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger-ui`

### "Failed to load API definition"

- Asegúrate de que `/swagger.json` responde correctamente
- Prueba: `http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger.json`

### "401 Unauthorized" en endpoints protegidos

- Haz clic en "Authorize" y pega tu JWT token
- Asegúrate de que el token no ha expirado
- Intenta de nuevo iniciando sesión

## 💡 Tips Útiles

✅ **Guardas Credenciales:** Swagger recuerda tu token entre sesiones  
✅ **Copiar CURL:** Cada endpoint muestra el comando CURL equivalente  
✅ **Modelos:** Puedes expandir/contraer esquemas complejos  
✅ **Búsqueda:** Usa Ctrl+F en el navegador para buscar endpoints

---

**¡Disfruta documentando y probando tu API!** 🚀
