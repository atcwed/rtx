SuperGame - HTML / CSS / JS (Three.js) template
=============================================

Contenido:
- index.html
- styles.css
- main.js (usa Three.js desde CDN / unpkg)
- assets/ (texturas placeholder)
- LICENSE (MIT)

Cómo usar:
1. Descomprime y abre index.html en un servidor local (recomendado) o usa `npx http-server` o `python -m http.server`.
2. Presiona 'Iniciar' en la UI para ejecutar el loop de render.
3. Reemplaza assets/*.jpg por tus texturas PBR (albedo, normal, metallic) y agrega modelos glTF si quieres.

Notas:
- El proyecto usa módulos ES importados desde unpkg (funciona en navegadores modernos).
- Para producción es recomendable usar un bundler (Vite, webpack) y empaquetar dependencias localmente.
