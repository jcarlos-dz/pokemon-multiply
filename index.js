const apiUrl = "https://pokeapi.co/api/v2/pokemon/"; //API base URL
const delay = 1500;
const offset = 0;
const limit = 665; //limiting Pokemons - sprites are not numbered properly after 665
const pokemonUrl = apiUrl + "?limit=" + limit + "&offset=" + offset; //complete URL with limit
const spriteUrl =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"; //base URL from which sprites are fetched

const MAX_NUMBER_OF_GUESSES = 3;

const spriteElement = document.getElementById("sprite"); //element object from HTML with an id 'sprite'
const streakElement = document.getElementById("streak"); //element object from HTML with an id 'streak'
const messageText = document.getElementById("message-text"); //element object from HTML with an id 'message-text'

var audioHit = new Audio("hit.wav");
var audioMiss = new Audio("miss.wav");
var countdown = 10;

var correctAnswer = -1;
var streak = 0; //initialize streak to zero
var pokemonData; //variable which holds the response from Pokemon API
var buttonsBlocked = false;
var num1, num2;

//function that fetched Pokemon data from the API
const fetchPokemonData = async () => {
  return fetch(pokemonUrl).then((response) => response.json());
};

const fetchPokemonDetails = async (pokemonName) => {
  return fetch(apiUrl + pokemonName).then((response) => response.json());
};

//main function
const main = async () => {
  let response = await fetchPokemonData(pokemonUrl);
  pokemonData = response.results; //save API response to pokemonData variable
  getPokemon();
  startCountdown();
};

const displayInteraction = (whichAudio, whichButton, whichClass) => {
  whichAudio.play();
  streakElement.classList.add(whichClass);
  whichButton.classList.add(whichClass);
};

//function that compares player's guess with Pokemon name and based on that either increases or resets streak
const checkGuess = async (button = null) => {
  if (buttonsBlocked) {
    // So that player cannot press the button again while showing correct answer
    return;
  }

  buttonsBlocked = true;
  let theClass = "";
  let theButton = "";
  let theAudio = "";

  if (
    button != null &&
    parseInt(button.getAttribute("data-id")) === correctAnswer
  ) {
    streak++; //correct guess - increase streak by one
    theAudio = audioHit;
    theButton = button;
    theClass = "hit";
    messageText.innerHTML = `Has derrotado a un ${pokemonData[pokemon].name}!`;
  } else {
    let correctButton = document.querySelectorAll(
      '[data-id="' + correctAnswer + '"]'
    );
    theAudio = audioMiss;
    theButton = correctButton[0];
    theClass = "miss";
    document.getElementById("progress-bar").hidden = true;
    messageText.innerHTML = `Has sido derrotado por un ${pokemonData[pokemon].name}!`;
  }
  displayInteraction(theAudio, theButton, theClass);

  streakElement.innerHTML = "Streak: " + streak; // show new streak value
  spriteElement.style.setProperty("transition", "filter 1s ease-out"); // add CSS property to reveal Pokemon with simple transition from shadow to normal brightness
  spriteElement.style.setProperty("filter", "initial");

  if (theClass == "hit") {
    setTimeout(() => {
      theButton.classList.remove(theClass);
      streakElement.classList.remove(theClass);
    }, delay); // wait before generating new Pokemon and start the same logic again

    setTimeout(() => getPokemon(), delay); // wait before generating new Pokemon and start the same logic again
  }
};

//function that generates random number, shows a Pokemon's shadow with that number and saves Pokemon name to variable
const getPokemon = async () => {
  // Initialization
  pokemon = getRandomIntInclusive(offset, limit + offset); //get a random number

  num1 = Math.floor(Math.random() * 10) + 1;
  num2 = Math.floor(Math.random() * 10) + 1;

  if (num1 == 1) num1++;
  if (num2 == 1) num2++;
  if (num1 == 10) num1--;
  if (num2 == 10) num2--;

  const question = `¿Cuánto es ${num1} x ${num2}?`;
  document.getElementById("question").textContent = question;

  let options = [
    0,
    (num1 - 1) * num2,
    num1 * (num2 - (Math.floor(Math.random() * 2) + 1)),
    (num1 + 1) * num2,
    num1 * (num2 + (Math.floor(Math.random() * 2) + 1)),
  ];

  let i = 0;
  let equals;
  do {
    options = options.sort();
    equals = false;
    for (; i < options.length - 1; i++) {
      if (options[i] == options[i + 1]) {
        equals = true;
        options[i + 1] += i + 1;
      }
    }
  } while (equals);

  options[0] = num1 * num2;

  const used = [];
  let option = 0;
  while (option < 5) {
    rand = Math.floor(Math.random() * 5);
    if (!used.includes(rand)) {
      used.push(rand);
      let button = "guess" + option;
      document.getElementById(button).innerText = options[rand];
      if (options[rand] == num1 * num2) {
        correctAnswer = option;
      }
      option++;
    }
  }

  messageText.innerHTML = "";

  spriteElement.src = "loading.gif";

  let pokemonDetails = await fetchPokemonDetails(pokemonData[pokemon].name);

  spriteElement.style.setProperty("transition", "initial"); //reset CSS transition property
  spriteElement.src = ""; //reset sprite URL so it has smooth transition to new Pokemon sprite

  let sprite = pokemonDetails.sprites.other["official-artwork"].front_default;
  if (sprite == null) sprite = pokemonDetails.sprites.front_default;
  spriteElement.src = sprite; //set URL to src property of img tag

  buttonsBlocked = false;

  countdown = 10;
  document.getElementById("progress").classList.remove("progress");
  void document.getElementById("progress").offsetWidth;
  document.getElementById("progress").classList.add("progress");
};

//function that generates random number between min value and max value.
const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};

const startCountdown = () => {
  setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      countdown = 0;
      checkGuess();
    }
  }, 1000);
};

//function call that starts application
main();
