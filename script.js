class Person {
  constructor(name, isActive) {
    this.name = name;
    this.isActive = isActive;
  }
}

const nameInput = document.getElementById("input-name");
const nameInputForm = document.getElementById("name-input-form");
const addNameBtn = document.getElementById("btn-add-name");
const namesVisualContainer = document.getElementById("names-container");
const teamSize = document.getElementById("team-size");
const labelForTeamSize = document.getElementById("team-size-label");
const generateTeamsBtn = document.getElementById("generate-teams-btn");
const generatedTeamsContainer = document.getElementById("generated-teams");

const state = {
  people: [],
};

nameInputForm.addEventListener("submit", (event) => {
  event.preventDefault(); //prevent site refresh after name submit
});

addNameBtn.addEventListener("click", addNameToList);

teamSize.addEventListener("input", () => {
  renderLabelTextForSlider();
  adjustMaxValueOfSlider();
});

generateTeamsBtn.addEventListener("click", generateTeamsWithMarkup);

getDataFromLocalStorage();
render();

/******************************************************************************************/

function addNameToList() {
  if (nameInput.value.length > 0) {
    const person = new Person(nameInput.value, true);
    state.people.push(person);
    nameInput.value = "";
    updateLocalStorage();
    render();
  } else {
    console.error("input invalid");
  }
}

/**
 * delete person from array
 */
function deletePerson() {
  const personIndex = this.parentElement.parentElement.dataset.id;
  state.people.splice(personIndex, 1);

  updateLocalStorage();
  render();
}

/**
 * switch isActive property to either true or false
 */
function togglePersonActiveState() {
  const personIndex = this.parentElement.parentElement.dataset.id;

  if (state.people[personIndex].isActive) {
    state.people[personIndex].isActive = false;
  } else {
    state.people[personIndex].isActive = true;
  }

  updateLocalStorage();
  adjustMaxValueOfSlider();
  render();
}

function generateTeams() {
  const size = teamSize.value;
  const shuffledArray = shufflePeopleArray();
  const generatedTeams = [];

  const peoplePerGroup = Math.ceil(shuffledArray.length / size);
  console.log("people per group: " + peoplePerGroup);
  console.log("remainder: " + (state.people.length % size));

  let indexOfShuffledArray = 0;

  for (let i = 0; i < size; i++) {
    const team = [];
    for (let j = 0; j < peoplePerGroup; j++) {
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
  const peopleArrayCopy = getActivePeopleFromArray();
  const shuffledArray = [];

  for (let i = 0; i < state.people.length; i++) {
    const randomNbr = Math.floor(Math.random() * (state.people.length - i));

    shuffledArray.push(peopleArrayCopy[randomNbr]);
    peopleArrayCopy.splice(randomNbr, 1);
  }

  console.log(shuffledArray);
  return shuffledArray;
}

function getActivePeopleFromArray() {
  return state.people.filter((element) => element.isActive);
}

/**
 * set max value of slider according to people count, so a group can always contain 2 people
 * if there are too few people, disable input
 */
function adjustMaxValueOfSlider() {
  const peopleAmount = getActivePeopleFromArray().length;
  if (peopleAmount <= 3) {
    teamSize.disabled = true;
  } else {
    teamSize.disabled = false;
    teamSize.setAttribute("max", Math.floor(peopleAmount / 2));
  }
}

function generateTeamsWithMarkup() {
  generatedTeamsContainer.innerHTML = "";
  const generatedTeams = generateTeams();
  let teamNameCount = 1;

  generatedTeams.forEach((team) => {
    const divTeamContainer = document.createElement("div");
    const teamName = document.createElement("h2");
    teamName.innerText = "Team " + teamNameCount;
    divTeamContainer.appendChild(teamName);
    const teamList = document.createElement("ul");
    divTeamContainer.appendChild(teamList);

    team.forEach((element) => {
      const listItemPerson = document.createElement("li");
      listItemPerson.innerText = element.name;
      teamList.appendChild(listItemPerson);
    });

    generatedTeamsContainer.appendChild(divTeamContainer);
    teamNameCount++;
  });
}

/**
 * create markup for current element of people array
 * @param {*} arrayElement
 * @param {*} id
 */
function createAsMarkupElement(arrayElement, id) {
  const nameContainer = document.createElement("span");
  nameContainer.setAttribute("data-id", id);

  if (arrayElement.isActive) {
    nameContainer.classList.add("name-element");
  } else {
    nameContainer.classList.add("name-element-disabled");
  }

  const name = document.createElement("span");
  name.innerText = arrayElement.name;
  nameContainer.appendChild(name);

  createOptionElements(nameContainer);
  namesVisualContainer.appendChild(nameContainer);
}

function createOptionElements(spanElement) {
  const optionsContainer = document.createElement("span");
  optionsContainer.classList.add("name-element-options");

  const deleteOption = document.createElement("span");
  deleteOption.innerText = "✕";
  const disableOption = document.createElement("span");
  disableOption.innerText = "⊘";

  deleteOption.addEventListener("click", deletePerson);
  disableOption.addEventListener("click", togglePersonActiveState);

  optionsContainer.appendChild(deleteOption);
  optionsContainer.appendChild(disableOption);
  spanElement.appendChild(optionsContainer);
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
