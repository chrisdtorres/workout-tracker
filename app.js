const STORAGE = "workout-tracker-html";

const days = ["Upper A", "Upper B", "Lower A", "Lower B"];



/* NEWCODE */
function ftToIn(value) {
  if (value === "" || isNaN(value)) return value;
  return (Number(value) * 12).toFixed(1);
}

function inToFt(value) {
  if (value === "" || isNaN(value)) return value;
  return (Number(value) / 12).toFixed(2);
}

function convertProfileValues() {
  const lengthFields = [
    "height",
    "reach",
    "verticalReach",
    "approachReach"
  ];

  lengthFields.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.value =
      unitMode === "in"
        ? ftToIn(input.value)
        : inToFt(input.value);
  });
}


let workouts = {
  "Upper A": [],
  "Upper B": [],
  "Lower A": [],
  "Lower B": [],
  "Volleyball": []
};

const savedWorkouts = localStorage.getItem("workouts");
if (savedWorkouts) {
  workouts = JSON.parse(savedWorkouts);
}


let state = JSON.parse(localStorage.getItem(STORAGE)) || {
  workouts: Object.fromEntries(days.map(d => [d, []])),
  profile: {}
};

let unitMode = "ft"; // or "in"


/* PLANNER */

const list = document.getElementById("exerciseList");


function populateDays() {
  daySelect.innerHTML = "";
  Object.keys(workouts).forEach(day => {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  });
}

populateDays();

function renderExercises() {
  const list = document.getElementById("exerciseList");
  const day = daySelect.value;

  list.innerHTML = "";

  workouts[day].forEach((ex, index) => {
    const div = document.createElement("div");
    div.className = "exercise-card";

    div.innerHTML = `
      <input class="exercise-title" data-index="${index}" value="${ex.name}" />

      <div class="row">
        <input type="number" class="edit-sets" data-index="${index}" value="${ex.sets}" />
        <input type="number" class="edit-reps" data-index="${index}" value="${ex.reps}" />
        <input type="number" class="edit-weight" data-index="${index}" value="${ex.weight}" />
      </div>

      <button class="delete-exercise" data-index="${index}">Delete</button>
    `;

    list.appendChild(div);
  });
}

document.getElementById("addExercise").addEventListener("click", () => {
  const name = document.getElementById("exerciseName").value.trim();
  const sets = Number(document.getElementById("sets").value);
  const reps = Number(document.getElementById("reps").value);
  const weight = Number(document.getElementById("weight").value);
  const day = daySelect.value;

  if (!name) return;

  workouts[day].push({
    name,
    sets: sets || 0,
    reps: reps || 0,
    weight: weight || 0
  });

  document.getElementById("exerciseName").value = "";
  document.getElementById("sets").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("weight").value = "";

  saveWorkouts();
  renderExercises();
});

document.getElementById("exerciseList").addEventListener("input", (e) => {
  const day = daySelect.value;
  const index = e.target.dataset.index;
  if (index === undefined) return;

  const ex = workouts[day][index];

  if (e.target.classList.contains("exercise-title")) {
    ex.name = e.target.value;
  }

  if (e.target.classList.contains("edit-sets")) {
    ex.sets = Number(e.target.value);
  }

  if (e.target.classList.contains("edit-reps")) {
    ex.reps = Number(e.target.value);
  }

  if (e.target.classList.contains("edit-weight")) {
    ex.weight = Number(e.target.value);
  }

  saveWorkouts();
});

document.getElementById("exerciseList").addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-exercise")) return;

  const day = daySelect.value;
  const index = e.target.dataset.index;

  workouts[day].splice(index, 1);
  saveWorkouts();
  renderExercises();
});

function saveWorkouts() {
  localStorage.setItem("workouts", JSON.stringify(workouts));
}

daySelect.addEventListener("change", renderExercises);
renderExercises();


/* Tabs */
document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

/* Profile */
document.querySelectorAll("[data-key]").forEach(input => {
  input.value = state.profile[input.dataset.key] || "";
  input.oninput = () => {
    state.profile[input.dataset.key] = input.value;
    save();
  };
});

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  updateProfileUnitLabels();
});



/* ===== CALENDAR ===== */

const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const todayBtn = document.getElementById("todayBtn");

const dayEditor = document.getElementById("dayEditor");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const dayWorkout = document.getElementById("dayWorkout");

const saveDayWorkout = document.getElementById("saveDayWorkout");
const clearDayWorkout = document.getElementById("clearDayWorkout");

state.calendar = state.calendar || {};

let currentDate = new Date();
let selectedDateKey = null;

function dateKey(date) {
  return date.toISOString().split("T")[0];
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(new Date());

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = dateKey(date);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (key === todayKey) cell.classList.add("today");

    cell.innerHTML = `<div>${d}</div>`;

    if (state.calendar[key]) {
      cell.innerHTML += `<div class="label">${state.calendar[key]}</div>`;
    }

    cell.onclick = () => {
      selectedDateKey = key;
      selectedDateLabel.textContent = key;
      dayWorkout.value = state.calendar[key] || "";
      dayEditor.classList.remove("hidden");
    };

    calendarGrid.appendChild(cell);
  }
}

document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

todayBtn.onclick = () => {
  currentDate = new Date();
  renderCalendar();
};

saveDayWorkout.onclick = () => {
  if (!selectedDateKey) return;
  state.calendar[selectedDateKey] = dayWorkout.value;
  save();
  renderCalendar();
};

clearDayWorkout.onclick = () => {
  if (!selectedDateKey) return;
  delete state.calendar[selectedDateKey];
  save();
  renderCalendar();
  dayEditor.classList.add("hidden");
};

renderCalendar();


/* ---------------- PROFILE ---------------- */

const profileInputs = document.querySelectorAll("#profile-form input");
const editBtn = document.getElementById("editProfileBtn");
const saveBtn = document.getElementById("saveProfileBtn");

const PROFILE_KEY = "profile-data";

// Load profile
const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
profileInputs.forEach(input => {
  if (savedProfile[input.id]) {
    input.value = savedProfile[input.id];
  }
});

editBtn.addEventListener("click", () => {
  profileInputs.forEach(input => input.disabled = false);
  editBtn.classList.add("hidden");
  saveBtn.classList.remove("hidden");
});

saveBtn.addEventListener("click", () => {
  const data = {};
  profileInputs.forEach(input => {
    input.disabled = true;
    data[input.id] = input.value;
  });

  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));

  saveBtn.classList.add("hidden");
  editBtn.classList.remove("hidden");
});


function updateProfileUnitLabels() {
  document.querySelectorAll(".unit[data-unit='length']").forEach(unit => {
    unit.textContent = unitMode === "in" ? "(in)" : "(ft)";
  });
}

document.getElementById("unitToggleBtn").addEventListener("click", () => {
  unitMode = unitMode === "ft" ? "in" : "ft";
convertProfileValues();        // ✅ converts numbers
updateProfileUnitLabels();     // ✅ updates (ft)/(in)


});


if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
