(function () {
  const clp = n => n == null ? "–" : "$" + Number(n).toLocaleString("es-CL", { maximumFractionDigits: 2 });
  const usd = n => n == null ? "" : "US$" + Number(n).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const VARIANTES = { normal: "Normal", holofoil: "Holo", reverseHolofoil: "Reverse Holo", "1stEditionHolofoil": "1ª Edición Holo", "1stEditionNormal": "1ª Edición", unlimitedHolofoil: "Holo (Unlimited)" };
  const variante = v => v ? (VARIANTES[v] || v) : "";
  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const sort = document.getElementById("sort");
  const empty = document.getElementById("empty");
  const langBox = document.getElementById("idiomas");
  let data = { cartas: [] };
  let idiomaSel = "";
  const idiomaKey = c => norm(String(c.idioma ?? "").trim()) || "sin-idioma";
  const idiomaLabel = c => { const t = String(c.idioma ?? "").trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Sin idioma"; };

  function buildIdiomas() {
    const m = new Map();
    data.cartas.forEach(c => { const k = idiomaKey(c); if (!m.has(k)) m.set(k, { label: idiomaLabel(c), n: 0 }); m.get(k).n += 1; });
    const orden = ["espanol", "ingles"];
    const keys = [...m.keys()].sort((a, b) => (orden.indexOf(a) + 1 || 99) - (orden.indexOf(b) + 1 || 99) || a.localeCompare(b));
    langBox.innerHTML = [`<button type="button" class="chip" data-idioma="" aria-pressed="true">Todos <span>${data.cartas.length}</span></button>`]
      .concat(keys.map(k => `<button type="button" class="chip" data-idioma="${esc(k)}" aria-pressed="false">${esc(m.get(k).label)} <span>${m.get(k).n}</span></button>`)).join("");
  }

  const sorters = {
    "precio-desc": (a, b) => (b.precio_mercado_clp || 0) - (a.precio_mercado_clp || 0),
    "precio-asc": (a, b) => (a.precio_mercado_clp || 0) - (b.precio_mercado_clp || 0),
    "anio-desc": (a, b) => (b.anio || 0) - (a.anio || 0),
    "anio-asc": (a, b) => (a.anio || 0) - (b.anio || 0),
    "nombre-asc": (a, b) => a.nombre.localeCompare(b.nombre, "es"),
    "set-asc": (a, b) => a.set.localeCompare(b.set, "es") || String(a.numero).localeCompare(String(b.numero), "es", { numeric: true })
  };

  function cardHTML(c) {
    const img = c.imagen
      ? `<img src="${esc(c.imagen)}" alt="${esc(c.nombre)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'noimg',textContent:'Sin imagen'}))">`
      : `<span class="noimg">Sin imagen</span>`;
    const cant = `<span class="tag stock">Stock: ${c.cantidad ?? 1}</span>`;
    return `<article class="card">
      <div class="card-img">${img}</div>
      <div class="card-body">
        <h2>${esc(c.nombre)}</h2>
        ${c.nombre_en && c.nombre_en !== c.nombre ? `<p class="en">${esc(c.nombre_en)}</p>` : ""}
        <div class="tags">
          <span class="tag idioma">${esc(idiomaLabel(c))}</span>
          <span class="tag estado">Estado: ${esc(c.estado)}</span>
          <span class="tag rareza">${esc(c.rareza)}</span>
          ${c.variante ? `<span class="tag variante">${esc(variante(c.variante))}</span>` : ""}
          ${cant}
        </div>
        <dl>
          <dt>Set</dt><dd>${esc(c.set)} (${esc(c.codigo_set)})</dd>
          <dt>Número</dt><dd>${esc(c.numero)}</dd>
          <dt>Año</dt><dd>${esc(c.anio)}</dd>
          <dt>Tipo</dt><dd>${esc(c.categoria)} · ${esc(c.tipo)}</dd>
          ${c.variante ? `<dt>Variante</dt><dd>${esc(variante(c.variante))}</dd>` : ""}
          <dt>Idioma</dt><dd>${esc(c.idioma)}</dd>
          <dt>Ilustrador</dt><dd>${esc(c.ilustrador)}</dd>
          ${c.regulacion ? `<dt>Regulación</dt><dd>${esc(c.regulacion)}</dd>` : ""}
          <dt>Stock</dt><dd><strong>${c.cantidad ?? 1}</strong></dd>
        </dl>
        ${c.nota ? `<p class="nota">${esc(c.nota)}</p>` : ""}
        <div class="precios">
          <div class="precio"><small>Mercado</small><strong>${clp(c.precio_mercado_clp)}</strong><div class="usd">${usd(c.precio_mercado_usd)}${c.dolar_clp ? ` · dólar ${clp(c.dolar_clp)}` : ""}</div></div>
          <div class="precio sug"><small>Sugerido</small><strong>${clp(c.precio_sugerido_clp)}</strong>${(c.cantidad ?? 1) > 1 ? `<div class="usd">×${c.cantidad} = ${clp(c.precio_sugerido_clp * c.cantidad)}</div>` : ""}</div>
        </div>
        ${c.fuente ? `<a class="fuente" href="${esc(c.fuente)}" target="_blank" rel="noopener">Ver precio en TCGplayer ↗</a>` : ""}
      </div>
    </article>`;
  }

  function render() {
    const q = norm(search.value.trim());
    const list = data.cartas
      .filter(c => !idiomaSel || idiomaKey(c) === idiomaSel)
      .filter(c => !q || norm([c.nombre, c.nombre_en, c.set, c.codigo_set, c.numero, c.anio, c.rareza, c.ilustrador, c.idioma, c.categoria, c.tipo, c.nota, variante(c.variante)].join(" ")).includes(q))
      .sort(sorters[sort.value]);
    grid.innerHTML = list.map(cardHTML).join("");
    empty.hidden = list.length > 0;
    stats(list);
  }

  function stats(cs) {
    const n = c => c.cantidad ?? 1, filtrado = cs.length !== data.cartas.length;
    document.getElementById("stat-count").textContent = cs.reduce((s, c) => s + n(c), 0);
    document.getElementById("stat-distinct").textContent = filtrado ? `${cs.length} de ${data.cartas.length} distintas (filtro)` : `${cs.length} distintas`;
    document.getElementById("stat-market").textContent = clp(cs.reduce((s, c) => s + (c.precio_mercado_clp || 0) * n(c), 0));
    document.getElementById("stat-suggested").textContent = clp(cs.reduce((s, c) => s + (c.precio_sugerido_clp || 0) * n(c), 0));
    const f = data.actualizado ? new Date(data.actualizado + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : "";
    document.getElementById("footer-info").textContent = `Actualizado: ${f}${data.dolar_clp ? ` · Dólar: ${clp(data.dolar_clp)} CLP` : ""}`;
  }

  fetch("cartas.json?v=" + Date.now(), { cache: "no-store" })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => { data = d; buildIdiomas(); render(); })
    .catch(() => { empty.hidden = false; empty.textContent = "No se pudo cargar cartas.json."; });

  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  langBox.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    idiomaSel = b.dataset.idioma;
    langBox.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    render();
  });
})();
