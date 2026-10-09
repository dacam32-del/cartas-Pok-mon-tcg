# Colección Pokémon TCG de David

Catálogo de mis cartas coleccionables de Pokémon, con set, número, año, rareza, estado y precio aproximado en pesos chilenos (CLP).

**Ver la página:** https://dacam32-del.github.io/cartas-Pok-mon-tcg/

## Cómo funciona
- `cartas.json` es la única fuente de datos: cada carta es un objeto dentro de `"cartas"`.
- `index.html`, `style.css` y `app.js` leen ese archivo y muestran la grilla (con búsqueda y orden por precio, año, nombre o set).
- Para agregar una carta: edita `cartas.json`, haz commit y push a `main`. GitHub Pages actualiza la página en uno o dos minutos.

Precios: mercado = TCGplayer (NM) en USD convertido a CLP con el dólar del día; sugerido ≈ 1,3× mercado, con piso de $500.
