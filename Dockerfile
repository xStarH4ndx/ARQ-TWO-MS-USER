# --- STAGE 1: Build Stage ---
# Usamos Node.js 22. Si tu proyecto necesita una versión diferente, cámbiala aquí.
FROM node:22-alpine AS build

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
# Esto optimiza el uso del caché de Docker: si solo cambia el código, no se reinstalan dependencias.
COPY package*.json ./

# Instalar todas las dependencias (incluidas las de desarrollo necesarias para la compilación)
RUN npm install

# Copiar el resto del código fuente del proyecto
COPY . .

# Compilar la aplicación NestJS
# Esto generará los archivos de JavaScript en la carpeta 'dist'
RUN npm run build

# --- STAGE 2: Production Stage ---
# Usar una imagen base más ligera para la producción
FROM node:22-alpine AS production

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo los package.json para instalar las dependencias de producción
COPY package*.json ./

# Instalar solo las dependencias de producción (excluyendo las de desarrollo)
RUN npm install --omit=dev

# Copiar el código compilado desde la etapa de construcción
# La carpeta 'dist' contiene tu aplicación NestJS compilada
COPY --from=build /app/dist ./dist

# Exponer el puerto que usa tu microservicio.
# Un microservicio NestJS GRPC o con Microservices usa por defecto diferentes puertos.
# Si tu servicio de usuario tiene un puerto HTTP, o un puerto específico para gRPC/RabbitMQ
# (diferente al 3000 por defecto de NestJS HTTP), AJÚSTALO AQUÍ.
# Si solo es un microservicio GRPC o de RabbitMQ sin un puerto HTTP expuesto,
# es posible que no necesites EXPOSE aquí, o que sea un puerto específico para gRPC.
# Por ahora, usaré un placeholder, deberías verificar la configuración de tu microservicio.
EXPOSE 5000

# Comando para ejecutar la aplicación NestJS en producción
# Tu package.json tiene 'start:prod': "node dist/main"
CMD ["npm", "run", "start:prod"]