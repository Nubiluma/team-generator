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
const maxSizeInfo = document.getElementById("maxSizeInfo");
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
    nameInput.focus();
  } else {
    console.error("input invalid");
  }
}

/**
 * delete person from array
 */
function deletePerson() {
  const personIndex = this.dataset.personid;
  if (personIndex >= 0) {
    state.people.splice(personIndex, 1);
  } else {
    console.error("person id not found");
  }

  updateLocalStorage();
  render();
}

/**
 * switch isActive property to either true or false
 */
function togglePersonActiveState() {
  const personIndex = this.dataset.personid;

  if (state.people[personIndex].isActive) {
    state.people[personIndex].isActive = false;
  } else {
    state.people[personIndex].isActive = true;
  }

  updateLocalStorage();
  render();
}

/**
 * generate teams by splitting shuffled array and push results as array into returned array
 * first place people evenly, then place each remaining person into already formed teams
 * @returns generated Teams as array of arrays of people (obj)
 */
function generateTeams() {
  const size = teamSize.value;
  const shuffledArray = shufflePeopleArray();
  const generatedTeams = [];

  const peoplePerGroup = Math.floor(shuffledArray.length / size);

  //divide people into groups/teams
  for (let i = 0; i < size; i++) {
    const team = [];
    for (let j = 0; j < peoplePerGroup; j++) {
      if (shuffledArray[0] != null) {
        team.push(shuffledArray[0]);
        shuffledArray.shift();
      }
    }
    generatedTeams.push(team);
  }

  //place remaining people each into the generated teams
  for (let i = 0; i < shuffledArray.length; i++) {
    generatedTeams[i].push(shuffledArray[i]);
  }
  return generatedTeams;
}

/**
 * shuffle/mix people array's content
 * @returns shuffled array
 */
function shufflePeopleArray() {
  const activePeopleArray = getActivePeopleFromArray();
  const activePeopleCount = getActivePeopleFromArray().length;

  const shuffledArray = [];

  for (let i = 0; i < activePeopleCount; i++) {
    const randomNbr = Math.floor(Math.random() * (activePeopleCount - i));

    shuffledArray.push(activePeopleArray[randomNbr]);
    activePeopleArray.splice(randomNbr, 1);
  }

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
    divTeamContainer.classList.add("team-container");
    const teamName = document.createElement("h2");
    const teamHeaderTxt = document.createTextNode("Team " + teamNameCount);
    teamName.appendChild(teamHeaderTxt);
    divTeamContainer.appendChild(teamName);
    const teamList = document.createElement("ol");
    teamList.classList.add("team-member-list");
    divTeamContainer.appendChild(teamList);

    team.forEach((element) => {
      const listItemPerson = document.createElement("li");
      const personName = document.createTextNode(element.name);
      listItemPerson.appendChild(personName);
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
  nameContainer.setAttribute("data-personId", id);

  if (arrayElement.isActive) {
    nameContainer.classList.add("name-element");
  } else {
    nameContainer.classList.add("name-element-disabled");
  }

  const name = document.createElement("span");
  const personName = document.createTextNode(arrayElement.name);
  name.appendChild(personName);
  nameContainer.appendChild(name);

  createOptionElements(nameContainer, id);
  namesVisualContainer.appendChild(nameContainer);
}

/**
 * append delete and disable buttons to the element
 * @param {*} spanElement container span element of according person
 * @param {*} dataId forwarded person id of people array
 */
function createOptionElements(spanElement, dataId) {
  const optionsContainer = document.createElement("span");
  optionsContainer.classList.add("name-element-options");

  const deleteOption = document.createElement("button");
  const deleteSymbol = document.createTextNode("✕");
  deleteOption.setAttribute("data-personId", dataId);
  deleteOption.classList.add("name-element-options");
  deleteOption.classList.add("flex-order-1");
  deleteOption.appendChild(deleteSymbol);
  const disableOption = document.createElement("button");
  const disableSymbol = document.createTextNode("⊘");
  disableOption.setAttribute("data-personId", dataId);
  disableOption.classList.add("name-element-options");
  disableOption.classList.add("flex-order-minus1");
  disableOption.appendChild(disableSymbol);

  deleteOption.addEventListener("click", deletePerson);
  disableOption.addEventListener("click", togglePersonActiveState);

  spanElement.appendChild(deleteOption);
  spanElement.appendChild(disableOption);
}

/******************************************************************************************/

function render() {
  namesVisualContainer.innerHTML = "";
  generatedTeamsContainer.innerHTML = "";
  maxSizeInfo.innerHTML = "";

  getDataFromLocalStorage();

  for (let i = 0; i < state.people.length; i++) {
    createAsMarkupElement(state.people[i], i);
  }

  renderLabelTextForSlider();
  adjustMaxValueOfSlider();

  if (teamSize.disabled === false) {
    const maxValue = document.createTextNode("(max: " + teamSize.max + ")");
    maxSizeInfo.appendChild(maxValue);
  }
}

/**
 * render number (label text) next to slider according to its value
 */
function renderLabelTextForSlider() {
  labelForTeamSize.innerHTML = "";
  const sizeValue = document.createTextNode(teamSize.value);
  labelForTeamSize.appendChild(sizeValue);
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
