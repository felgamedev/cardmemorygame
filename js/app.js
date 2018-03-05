const container = document.querySelector('.container');
const deck = document.querySelector('.deck');
const scorePanel = document.querySelector('.score-panel');
const numMovesSpan = document.querySelector('.moves');
const restartButton = document.querySelector('.restart');
const winPanel = document.createElement('div');
const winPanelHeader = document.createElement('h2');
const winPanelText = document.createTextNode('');
const winPanelStars = document.createElement('div');
const blackOverlay = document.createElement('div');

const timerPanel = document.createElement('div');
const timerMins = document.createElement('span');
const timerSecs = document.createElement('span');

let cards = [];
const openCards = [];
const starImageElements = [];
const spacerImageElements = [];
let timeoutId = null;
let timerIntervalId = null;
let movesCounter = 0;
let matchingPairsCount = 0;
let starsCount = 3;
let starsElements = scorePanel.querySelectorAll('i');
// Timer variables
let startTime = 0;
let nowTime = 0;
let minutes = 0;
let seconds = 0;

// Music for background
var bgMusic = new Audio("sfx/n_spade_music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.6;
bgMusic.play();

// Sound effects
var soundFlippedMatch = new Audio("sfx/smb3_nspade_match.wav");
var soundFlippedNoMatch = new Audio("sfx/smb3_bonus_game_no_match.wav");
var soundFlipped = new Audio("sfx/smb3_inventory_open_close.wav");
var soundWinWith3Stars = new Audio("sfx/smb3_level_clear.wav")
var soundWinWith1Star = new Audio("sfx/smb3_game_over.wav");

document.addEventListener('click', function(event){
  if(event.target.classList.contains('black-overlay')
  || event.target.classList.contains('win-panel')
  || event.target.parentNode.classList.contains('win-panel')){
    resetGameElementsAfterWin();
    gameInit();
  }
});

// Event Listeners
deck.addEventListener('click', function(event){
  let cardClicked;
  // Check to see if a card has been clicked
  if(event.target.nodeName == "LI"){ // Card area is clicked
    cardClicked = event.target;
  } else if(event.target.nodeName == "I"){ // Shown card icon is clicked
    cardClicked = event.target.parentElement;
  } else {
    return; // Empty deck area clicked
  }

  // Valid card selected, start timer if not already running
  if(startTime < 1) {startTimer();}

  // Don't do anything if the card has already been matched
  if(cardClicked.classList.contains('match')) { return; }
  // Prevent clicking the same card twice to create a match
  if(openCards.length > 0 && cardClicked === openCards[0]){
    console.log("Clicked the same card twice");
    return;
  }

  // Start a new pair by resetting the revealed card timeout
  if(timeoutId != null){
    // Do nothing if you clicked the open cards
    if(cardClicked == openCards[0] || cardClicked == openCards[1]){
      return;
    }
    if(openCards.length > 0){
      clearTimeout(timeoutId);
      rejectNonMatchingCards();
    }
  }

  // Play card clicked sound
  soundFlipped.play();

  // Reveal card
  toggleShowCard(cardClicked);
  // Add the card to the openCards list
  addToOpenList(cardClicked);
  // Check openCards for a match
  if(openCards.length > 1) {
    checkForMatch();
    incrementNumberOfMoves();
  }

  // Check if all pairs are complete
  checkForWin();
});

restartButton.addEventListener('click', function(event){
  if(matchingPairsCount == 8){
    resetGameElementsAfterWin();
  }
  stopTimer();
  gameInit();
});

// winPanel.addEventListener('click', function(event){
//
// });

container.addEventListener('animationstart', function(event){
  if(event.target == container){
    setTimeout(function(){
      container.classList.remove('matchPair');
    }, 1000, false);
  }
});

// Sound functions
function playMatchingCardsSound(){
  setTimeout(function(){soundFlippedMatch.play();}, 500);
}

function playNonMatchingCardsSound(){
  setTimeout(function(){soundFlippedNoMatch.play();}, 500);
}

// Card functions
function toggleShowCard(card){
  card.classList.toggle('show');
  card.classList.toggle('open');
}

function checkForMatch(){
  let cardOneClass = openCards[0].firstChild.classList[0];
  let cardTwoClass = openCards[1].firstChild.classList[0];

  if(cardOneClass == cardTwoClass){
    setMatchingCards();
    matchingPairsCount++;
    playMatchingCardsSound();
  } else {
    timeoutId = setTimeout(rejectNonMatchingCards, 1000);
    playNonMatchingCardsSound();
  }
}

function checkForWin(){
  if(matchingPairsCount === 8){
    // Win condition met
    stopTimer();
    updateWinPanel();
    showWinPanel();
  }
}

function setMatchingCards(){
  for(let i = 0; i < openCards.length; i++){
    openCards[i].classList.add('match');
  }
  container.classList.add('matchPair');

  clearOpenCards();
}

function rejectNonMatchingCards() {
  for(let i = 0; i < openCards.length; i++){
    toggleShowCard(openCards[i]);
  }

  clearOpenCards();
  timeoutId = null;
}

function clearOpenCards(){
  openCards.splice(0, 2);
}

function addToOpenList(card){
  openCards.push(card);
}

function createArrayOfCards(){
  cards = [];
  // Hardcoded 8 types of cards for a 16 card game
  const cardTypes = ["card-mushroom", "card-10coins", "card-20coins", "card-mario",
  "card-castle", "card-flower","card-star", "card-1up"];

  // Add two of each card to the array of cards
  for(let i = 0; i < cardTypes.length; i++){
    cards.push(createCard(cardTypes[i]));
    cards.push(createCard(cardTypes[i]));
  }
}

function createCard(cardTypesText){
  var cardElement = document.createElement("li");
  cardElement.classList.add('card');

  var innerImage = document.createElement("img");
  innerImage.classList.add(cardTypesText);
  innerImage.src = 'img/' + cardTypesText + '.png';
  cardElement.appendChild(innerImage);

  return cardElement;
}

// Win panel functions
function createWinPanel(){
  winPanel.classList.add('win-panel');
  winPanel.classList.add('score-panel');

  blackOverlay.classList.add('black-overlay');

  winPanelHeader.textContent = "You win!";
  winPanel.appendChild(winPanelStars);
  winPanel.appendChild(winPanelHeader);
  winPanel.appendChild(winPanelText);

  for(let i = 1; i <= 3; i++){
    var star = document.createElement('img');
    star.src = "img/star.png";
    starImageElements[i] = star;

    var spacer = document.createElement('img');
    spacer.src = "img/spacer.png";
    spacerImageElements[i] = spacer;
  }
}

function updateWinPanel(){
  clearWinPanelStars();

  // Update Stars HERE
  for(let i = 1; i <= 3; i++){
    if(i <= starsCount){
      winPanelStars.appendChild(starImageElements[i]);
    } else {
      console.log("attaching a spacer");
      winPanelStars.appendChild(spacerImageElements[i]);
    }
  }

  // Update Time HERE
  let time = timerMins.textContent + "m:" + timerSecs.textContent;

  // Update text
  winPanelText.textContent = "You beat the game in " + movesCounter +
  " moves, in " + time + "s earning " + starsCount + " stars. Click here to play again";
}

function clearWinPanelStars(){
  // Clear the stars div
  while(winPanelStars.firstChild){
    winPanelStars.removeChild(winPanelStars.lastChild);
  }
}

function showWinPanel(){
  deck.style.opacity = "50%";
  container.appendChild(blackOverlay);
  container.appendChild(winPanel);

  if(starsCount ===3){
    setTimeout(function(){soundWinWith3Stars.play();}, 500);
  } else {
    setTimeout(function(){soundWinWith1Star.play();}, 500);
  }
}

function resetGameElementsAfterWin(){
  container.appendChild(deck);
  blackOverlay.remove();
  winPanel.remove();
}

// Timer functions

function createTimerPanel(){
  timerMins.textContent = minutes;
  timerSecs.textContent = seconds + "0";
  let timerSpacer = document.createElement('span');
  timerSpacer.textContent = ':';

  timerPanel.appendChild(timerMins);
  timerPanel.appendChild(timerSpacer);
  timerPanel.appendChild(timerSecs);
  scorePanel.appendChild(timerPanel);
}

function startTimer(){
  startTime = Date.now();
  // Refresh the time in just under a
  timerIntervalId = setInterval(updateTimer, 500);
}

function stopTimer(){
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  updateTimer();
}

function updateTimer(){
  nowTime = Date.now();

  let timeElapsed = nowTime - startTime;
  let totalSeconds = Math.floor(timeElapsed/1000);
  seconds = totalSeconds % 60;
  minutes = (totalSeconds > 60) ? Math.floor(totalSeconds/60) : 0;

  // Push new time to page
  timerSecs.textContent = (seconds < 10) ? "0" + seconds : seconds;
  timerMins.textContent = minutes;
}

function clearTimer(){
  timerMins.textContent = "0";
  timerSecs.textContent = "00";
}

// Game setup functions
function gameInit(){
  // Create new array of cards
  createArrayOfCards();
  // Shuffle them using the Fisher-Yates/Knuth shuffle
  shuffle(cards);
  deck.innerHTML = '';
  // Fill the deck with the newly shuffled cards
  for(let i = 0; i < cards.length; i++){
    deck.appendChild(cards[i]);
  }

  // Initialize move counter to zero
  resetNumberOfMoves();

  // Reset number of matching pairs
  matchingPairsCount = 0;

  //Reset number of stars to 3
  starsCount = 3;
  resetStarsDisplay();

  // Reset timer variables
  startTime = minutes = seconds = nowTime = 0;
  timerIntervalId = null;
  clearTimer();
}

// Simple variable and DOM element reset
function resetNumberOfMoves(){
  movesCounter = 0;
  numMovesSpan.textContent = movesCounter;
}

// Reset the classList on all 3 stars
function resetStarsDisplay(){
  for(let i = 0; i < starsElements.length; i++){
    starsElements[i].classList.add('fa-star');
    starsElements[i].classList.remove('fa-star-o');
  }
}

// Increment movesCounter and check for star rating change
function incrementNumberOfMoves(){
   movesCounter++;
   numMovesSpan.textContent = movesCounter;
   if(movesCounter === 16){
     starsCount = 2;
     toggleStarsOff(2);
   }

   if(movesCounter === 22){
     starsCount = 1;
     toggleStarsOff(1);
   }

 }

 function toggleStarsOff(index){
   starsElements[index].classList.remove('fa-star');
   starsElements[index].classList.add('fa-star-o');
 }

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Launch game on page load
createWinPanel();
createTimerPanel();
gameInit();
