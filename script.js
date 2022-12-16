const nameInput = document.getElementById("input-name");
const nameInputForm = document.getElementById("name-input-form");
const addNameBtn = document.getElementById("btn-add-name");
const deleteSymbol = document.getElementById("symbol-delete");
const namesVisualContainer = document.getElementById("names-container");
const teamSize = document.getElementById("team-size");
const labelForTeamSize = document.getElementById("team-size-label");
const generateTeamsBtn = document.getElementById("generate-teams-btn");

const state = {
  people: [],
};

let currentlyDragged = null; //for drag and deleting

nameInputForm.addEventListener("submit", (event) => {
  event.preventDefault(); //prevent site refresh after name submit
});

addNameBtn.addEventListener("click", addNameToList);

deleteSymbol.addEventListener("dragover", function (event) {
  event.preventDefault();
});

deleteSymbol.addEventListener("dragenter", function (event) {
  event.preventDefault();
  deleteSymbol.classList.add("symbol-delete");
  deletePerson();
});

teamSize.addEventListener("input", () => {
  renderLabelTextForSlider();
  adjustMaxValueOfSlider();
});

generateTeamsBtn.addEventListener("click", generateTeams);

getDataFromLocalStorage();
render();

/******************************************************************************************/

function addNameToList() {
  if (nameInput.value.length > 0) {
    state.people.push(nameInput.value);
    nameInput.value = "";
    updateLocalStorage();
    render();
  } else {
    console.error("input invalid");
  }
}

/**
 * delete person from array when drag into delete symbol
 */
function deletePerson() {
  const personIndex = state.people.indexOf(currentlyDragged.innerText);
  state.people.splice(personIndex, 1);

  updateLocalStorage();
  render();
}

function generateTeams() {
  const size = teamSize.value;
  const shuffledArray = shufflePeopleArray();
  const generatedTeams = [];
  console.log(shuffledArray);

  const peoplePerGroup = Math.ceil(state.people.length / size);
  console.log("people per group: " + peoplePerGroup);
  console.log("remainder: " + (state.people.length % size));
  let indexOfShuffledArray = 0;

  for (let i = 0; i < size; i++) {
    const team = [];
    for (let j = 0; j < peoplePerGroup; j++) {
      console.log(indexOfShuffledArray);
      if (shuffledArray[indexOfShuffledArray] != null) {
        team.push(shuffledArray[indexOfShuffledArray]);
      }
      indexOfShuffledArray++;
    }

    generatedTeams.push(team);
  }

  console.log(generatedTeams);
  return generatedTeams;
}

/**
 * shuffle/mix people array's content
 * @returns shuffled array
 */
function shufflePeopleArray() {
  const peopleArrayCopy = [...state.people];
  const shuffledArray = [];

  for (let i = 0; i < state.people.length; i++) {
    const randomNbr = Math.floor(Math.random() * (state.people.length - i));

    shuffledArray.push(peopleArrayCopy[randomNbr]);
    peopleArrayCopy.splice(randomNbr, 1);
  }

  return shuffledArray;
}

/**
 * set max value of slider according to people count, so a group can always contain 2 people
 * if there are too few people, disable input
 */
function adjustMaxValueOfSlider() {
  const peopleAmount = state.people.length;
  if (peopleAmount <= 3) {
    teamSize.disabled = true;
  } else {
    teamSize.disabled = false;
    teamSize.setAttribute("max", Math.floor(peopleAmount / 2));
  }
}

function createAsMarkupElement(arrayElement, id) {
  const span = document.createElement("span");
  span.setAttribute("draggable", true);
  span.setAttribute("data-id", id);
  span.innerText = arrayElement.toString();
  namesVisualContainer.appendChild(span);
  span.classList.add("name-element");

  span.addEventListener("dragstart", function (event) {
    currentlyDragged = event.target;
    console.log(currentlyDragged);
  });
}

/******************************************************************************************/

function render() {
  namesVisualContainer.innerHTML = "";
  getDataFromLocalStorage();

  for (let i = 0; i < state.people.length; i++) {
    createAsMarkupElement(state.people[i], i);
  }

  renderLabelTextForSlider();
  adjustMaxValueOfSlider();
}

/**
 * render number (label text) next to slider according to its value
 */
function renderLabelTextForSlider() {
  labelForTeamSize.innerText = teamSize.value;
}

/******************************************************************************************/

/**
 * get data from local storage
 */
function getDataFromLocalStorage() {
  const peopleNamesFromLocalStorage = localStorage.getItem("people");
  if (peopleNamesFromLocalStorage !== null) {
    state.people = JSON.parse(peopleNamesFromLocalStorage);
  }
}

/**
 * load registered people to local storage
 */
function updateLocalStorage() {
  localStorage.setItem("people", JSON.stringify(state.people));
}
