# Etap 1: budowanie aplikacji React/Vite
FROM node:22-alpine AS build

WORKDIR /app

# Najpierw kopiujemy pliki zależności,
# aby Docker mógł wykorzystać cache
COPY package.json package-lock.json ./

RUN npm ci

# Następnie kopiujemy kod aplikacji
COPY . .

# Zmienne Vite potrzebne podczas budowania
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Tworzy produkcyjny folder dist
RUN npm run build

# Etap 2: serwowanie gotowej aplikacji przez Nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "echo '\n🚀 TickTrack is available at http://localhost:8080\n'; nginx -g 'daemon off;'"]