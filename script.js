const table = document.getElementById("villagersTable");



// Funciones para guardar y recuperar corazones
function getHearts(id) {
    return parseInt(localStorage.getItem("hearts_" + id)) || 0;
}

function setHearts(id, value) {
    localStorage.setItem("hearts_" + id, value);
}

// Reset de corazones
function resetHearts() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("hearts_")) localStorage.removeItem(key);
    });
    renderVillagers();

}
document.getElementById("resetHearts").addEventListener("click", resetHearts);

// Cargar aldeanos JSON
// Ejemplo de manejo de error al cargar aldeanos
async function loadVillagers() {
    try {
        const res = await fetch("villagers.json?t=" + new Date().getTime());
        return await res.json();
    } catch (e) {
        alert("No se pudo cargar la lista de aldeanos.");
        return {};
    }
}

// Renderizar aldeanos
async function renderVillagers() {
    const data = await loadVillagers();
    const recipesData = await loadRecipes(); // Carga recetas una sola vez
    const recipes = Object.values(recipesData);

    // Limpiar tabla
    table.innerHTML = "";

    // Filtrar la clave "recipes" si existe y ordenar aldeanos por corazones
    const villagersArray = Object.entries(data)
        .filter(([id]) => id !== "recipes")
        .sort((a, b) => getHearts(b[0]) - getHearts(a[0]));

    villagersArray.forEach(([id, villager]) => {
        const tr = document.createElement("tr");

        // Nombre con imagen
        const tdName = document.createElement("td");
        const link = document.createElement("a");
        link.href = `https://stardewvalleywiki.com/${villager.name}`;
        link.target = "_blank";

        const img = document.createElement("img");
        img.src = villager.img;
        img.alt = villager.name;

        link.appendChild(img);
        tdName.appendChild(link);
        tdName.appendChild(document.createTextNode(villager.name));
        tr.appendChild(tdName);

        // Corazones
        const tdHearts = document.createElement("td");
        tdHearts.classList.add("hearts");
        const heartsCount = getHearts(id);
        for (let i = 0; i < 10; i++) {
            const span = document.createElement("span");
            span.textContent = "❤";
            if (i < heartsCount) span.classList.add("done");

            span.addEventListener("click", (e) => {
                e.stopPropagation();
                let current = getHearts(id);
                if (i < current) current = i;
                else current = i + 1;
                setHearts(id, current);

                Array.from(tdHearts.children).forEach((s, idx) => {
                    s.classList.toggle("done", idx < current);
                });
            });

            tdHearts.appendChild(span);
        }
        tr.appendChild(tdHearts);

        // Checks de regalos
        for (let i = 0; i < 2; i++) {
            const tdGift = document.createElement("td");
            const div = document.createElement("div");
            div.classList.add("check");
            div.addEventListener("click", () => div.classList.toggle("done"));
            tdGift.appendChild(div);
            tr.appendChild(tdGift);
        }

        // Notas y mejores regalos (imágenes de recetas)
        const tdNotes = document.createElement("td");
        villager.gifts?.forEach(gift => {
            const imgGift = document.createElement("img");
            imgGift.src = gift;
            imgGift.style.cursor = "pointer";

            // Verifica si el regalo es una receta elaborada
            const receta = recipes.find(r => r.img === gift);

            if (receta) {
                imgGift.addEventListener("click", () => {
                    const recetaId = "receta-" + receta.name.replace(/\s+/g, "-").toLowerCase();
                    const recetaRow = document.getElementById(recetaId);
                    if (recetaRow) {
                        recetaRow.scrollIntoView({ behavior: "smooth", block: "center" });
                        recetaRow.classList.add("highlight");
                        setTimeout(() => recetaRow.classList.remove("highlight"), 2000);
                    }
                });
            }
            tdNotes.appendChild(imgGift);
        });
        tr.appendChild(tdNotes);

        table.appendChild(tr);
    });
}

// Inicializar
renderRecipes();
renderVillagers();

async function loadRecipes() {
    const res = await fetch("recipes.json?t=" + new Date().getTime());
    return await res.json();
}

async function renderRecipes() {
    const data = await loadRecipes();
    const recipes = Object.values(data);

    const recipesList = document.getElementById("recipesList");
    recipesList.innerHTML = "";

    const table = document.createElement("table");
    table.className = "recipes-table";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    const thReceta = document.createElement("th");
    thReceta.textContent = "Receta";
    const thIngredientes = document.createElement("th");
    thIngredientes.textContent = "Ingredientes";
    trHead.appendChild(thReceta);
    trHead.appendChild(thIngredientes);
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    recipes.forEach(recipe => {
        const tr = document.createElement("tr");
        // Asigna un id único usando el nombre normalizado
        tr.id = "receta-" + recipe.name.replace(/\s+/g, "-").toLowerCase();

        // Columna receta (solo imagen + nombre, sin enlace)
        const tdReceta = document.createElement("td");
        if (recipe.img) {
        const img = document.createElement("img");
        img.src = recipe.img;
        img.alt = recipe.name;
        img.style.verticalAlign = "middle";
        img.style.marginRight = "8px";
        tdReceta.appendChild(img);
        }
        tdReceta.appendChild(document.createTextNode(recipe.name));

        // Columna ingredientes (solo imágenes)
        const tdIngredientes = document.createElement("td");
        (recipe.ingredients || []).forEach(ing => {
        const imgIng = document.createElement("img");
        imgIng.src = ing;
        imgIng.alt = "Ingrediente";
        imgIng.style.margin = "2px";
        tdIngredientes.appendChild(imgIng);
        });

        tr.appendChild(tdReceta);
        tr.appendChild(tdIngredientes);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    recipesList.appendChild(table);
}