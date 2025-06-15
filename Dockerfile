# Usa una imagen base de Node.js adecuada (ej. LTS)
# FROM node:20-alpine # Si usas Node.js 20
FROM node:22-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
# Esto optimiza el uso del caché de Docker
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies si las necesitas para el inicio/pruebas en dev)
RUN npm install

# Copiar el resto del código fuente de tu proyecto.
# En desarrollo, generalmente quieres todo el código fuente.
COPY . .

# Exponer el puerto que usa tu microservicio.
# Para desarrollo, el puerto que expongas dependerá de cómo lo uses.
# Si es un microservicio GRPC o de RabbitMQ, es posible que no "expongas" un puerto HTTP tradicional
# o que necesites un puerto específico para esos protocolos.
# Ajusta este puerto al que tu 'ms-users' realmente esté escuchando si es HTTP,
# o si necesitas mapear un puerto para GRPC/RabbitMQ.
# Por defecto, NestJS puede usar 3000 si tiene una capa HTTP/GraphQL.
EXPOSE 5000

# Comando para ejecutar la aplicación NestJS en desarrollo.
# Tu package.json probablemente tiene un script 'start:dev'.
# Si el script 'start:dev' ejecuta 'nest start --watch', es ideal para desarrollo.
CMD ["npm", "run", "start:dev"]

# Notas adicionales para desarrollo con este Dockerfile:
# - Este Dockerfile de una sola etapa será más grande que una imagen de producción optimizada
#   porque incluye todas las dependencias de desarrollo y el código fuente completo.
# - Es para facilidad de desarrollo/pruebas locales, no para un despliegue optimizado en producción.
# - Asegúrate de que tu script 'start:dev' de 'ms-users' sea apropiado para iniciar
#   el microservicio en un contenedor.