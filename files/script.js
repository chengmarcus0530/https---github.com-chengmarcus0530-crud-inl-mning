const apiUrl = "http://localhost:3000/movies";

const movieList = document.getElementById("movieList");
const form = document.getElementById("movieForm");

function createButton(text, className) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = className;
  btn.type = "button";
  return btn;
}

function createMovieListItem(movie) {
  const li = document.createElement("li");
  li.dataset.id = movie.id;

  const infoDiv = document.createElement("div");
  infoDiv.className = "movie-info";

  const strongTitle = document.createElement("strong");
  strongTitle.textContent = movie.title;
  infoDiv.appendChild(strongTitle);

  const spanDetails = document.createElement("span");
  spanDetails.textContent = `${movie.year} - ${movie.genre}`;
  infoDiv.appendChild(spanDetails);

  li.appendChild(infoDiv);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "movie-actions";

  const deleteBtn = createButton("Ta bort", "delete-btn");
  const editBtn = createButton("Ändra", "edit-btn");

  actionsDiv.appendChild(deleteBtn);
  actionsDiv.appendChild(editBtn);

  li.appendChild(actionsDiv);

  return li;
}

async function getMovies() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Kunde inte hämta filmer");
    const movies = await res.json();

    movieList.innerHTML = "";

    movies.forEach(movie => {
      const li = createMovieListItem(movie);
      movieList.appendChild(li);
    });
  } catch (error) {
    alert("Fel vid hämtning av filmer: " + error.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newMovie = {
    title: document.getElementById("title").value,
    year: Number(document.getElementById("year").value),
    genre: document.getElementById("genre").value
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMovie)
    });
    if (!res.ok) throw new Error("Kunde inte lägga till filmen");

    form.reset();
    getMovies();
  } catch (error) {
    alert("Fel vid skapande av film: " + error.message);
  }
});

movieList.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Kunde inte ta bort filmen");
      li.remove();
    } catch (error) {
      alert("Fel vid borttagning: " + error.message);
    }
  }

  if (e.target.classList.contains("edit-btn")) {
    enableInlineEdit(li, id);
  }
});

function enableInlineEdit(li, id) {
  const infoDiv = li.querySelector(".movie-info");
  const actionsDiv = li.querySelector(".movie-actions");

  const title = infoDiv.querySelector("strong").textContent;
  const yearGenreText = infoDiv.querySelector("span").textContent;
  const [year, genre] = yearGenreText.split(" - ").map(s => s.trim());

  infoDiv.textContent = "";

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.className = "edit-title";
  inputTitle.value = title;

  const inputYear = document.createElement("input");
  inputYear.type = "number";
  inputYear.className = "edit-year";
  inputYear.value = year;
  inputYear.style.width = "70px";

  const inputGenre = document.createElement("input");
  inputGenre.type = "text";
  inputGenre.className = "edit-genre";
  inputGenre.value = genre;
  inputGenre.style.width = "100px";

  infoDiv.appendChild(inputTitle);
  infoDiv.appendChild(inputYear);
  infoDiv.appendChild(inputGenre);

  actionsDiv.textContent = "";

  const saveBtn = createButton("Spara", "save-btn");
  const cancelBtn = createButton("Avbryt", "cancel-btn");

  actionsDiv.appendChild(saveBtn);
  actionsDiv.appendChild(cancelBtn);

  saveBtn.onclick = async () => {
    const newTitle = inputTitle.value.trim();
    const newYear = inputYear.value.trim();
    const newGenre = inputGenre.value.trim();

    if (!newTitle || !newYear || !newGenre) {
      alert("Fyll i alla fält!");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          year: Number(newYear),
          genre: newGenre
        })
      });
      if (!res.ok) throw new Error("Kunde inte uppdatera filmen");

      restoreView(li, newTitle, newYear, newGenre);
    } catch (error) {
      alert("Fel vid uppdatering: " + error.message);
    }
  };

  cancelBtn.onclick = () => {
    restoreView(li, title, year, genre);
  };
}

function restoreView(li, title, year, genre) {
  const infoDiv = li.querySelector(".movie-info");
  const actionsDiv = li.querySelector(".movie-actions");

  infoDiv.textContent = "";

  const strongTitle = document.createElement("strong");
  strongTitle.textContent = title;
  infoDiv.appendChild(strongTitle);

  const spanDetails = document.createElement("span");
  spanDetails.textContent = `${year} - ${genre}`;
  infoDiv.appendChild(spanDetails);

  actionsDiv.textContent = "";

  const deleteBtn = createButton("Ta bort", "delete-btn");
  const editBtn = createButton("Ändra", "edit-btn");

  actionsDiv.appendChild(deleteBtn);
  actionsDiv.appendChild(editBtn);
}

async function getMovieById(id) {
  try {
    const res = await fetch(`${apiUrl}/${id}`);
    if (!res.ok) throw new Error("Ingen film hittades med det id:t");
    const movie = await res.json();
    return movie;
  } catch (error) {
    alert("Fel vid hämtning av film: " + error.message);
  }
}

document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("searchId").value.trim();
  const movie = await getMovieById(id);
  if (movie) {
    console.log(movie);

    const popup = document.createElement("div");
    popup.id = "searchPopup";
    popup.textContent = `${movie.title} (${movie.year}) - ${movie.genre}`;

    const closeBtn = createButton("Ta bort", "delete-btn");
    closeBtn.onclick = () => popup.remove();
    popup.appendChild(closeBtn);

    const existing = document.getElementById("searchPopup");
    if (existing) existing.remove();

    document.getElementById("searchResult").appendChild(popup);
  }
});

getMovies();