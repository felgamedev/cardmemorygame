const container = document.querySelector('.container');
const deck = document.querySelector('.deck');
const scorePanel = document.querySelector('.score-panel');
const numMovesSpan = document.querySelector('.moves');
const restartButton = document.querySelector('.restart');
const winPanel = document.createElement('div');
const winPanelHeader = document.createElement('h2');
const winPanelText = document.createTextNode('');

const timerPanel = document.createElement('div');
const timerMins = document.createElement('span');
const timerSecs = document.createElement('span');

let cards = [];
const openCards = [];
var timeoutId = null;
var timerIntervalId = null;
let movesCounter = 0;
let matchingPairsCount = 0;
let starsCount = 3;
let starsElements = scorePanel.querySelectorAll('i');
// Timer variables
let startTime = nowTime = minutes = seconds = 0;

// Event Listeners
deck.addEventListener('click', function(event){
	let cardClicked;
	// Check to see if a card has been clicked
	if(event.target.nodeName == "LI"){ // Card area is clicked
		cardClicked = event.target;
	} else if(event.target.nodeName == "I"){ // Shown card icon is clicked
		cardClicked = event.target.parentElement;
	}else return; // Empty deck area clicked

	// Valid card selected, start timer if not already running
	if(startTime < 1) startTimer();

	// Don't do anything if the card has already been matched
	if(cardClicked.classList.contains('match')) return;
	// Prevent clicking the same card twice to create a match
	if(openCards.length > 0 && cardClicked === openCards[0]){
		console.log("Clicked the same card twice");
		return;
	}

	// Start a new pair by resetting the revealed card timeout
	if(timeoutId != null){
		// Do not
		if(cardClicked == openCards[0] || cardClicked == openCards[1]){
			return;
		}
		if(openCards.length > 0){
			clearTimeout(timeoutId);
			rejectNonMatchingCards();
		}
	}

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

winPanel.addEventListener('click', function(event){
	resetGameElementsAfterWin();
	gameInit();
})

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
	} else {
		timeoutId = setTimeout(rejectNonMatchingCards, 1000);
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
	innerImage.src = 'img/' + cardTypesText + '.png'
	cardElement.appendChild(innerImage);

	return cardElement;
}

// Win panel functions
function createWinPanel(){
	winPanelHeader.textContent = "You win!";
	winPanel.appendChild(winPanelHeader);
	winPanel.appendChild(winPanelText);
	winPanel.classList.add('container');
}

function updateWinPanel(){
	winPanelText.textContent = `You beat the game in ${movesCounter} moves, earning ${starsCount} stars. Click HERE to play again`;
}

function showWinPanel(){
	const parent = deck.parentElement;
	deck.remove();
	parent.appendChild(winPanel);
}

function resetGameElementsAfterWin(){
	container.appendChild(deck);
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
	console.log("startTimer run");
	// Refresh the time in just under a
	timerIntervalId = setInterval(updateTimer, 500);
}

function stopTimer(){
	clearInterval(timerIntervalId);
	updateTimer();
}

function updateTimer(){
	console.log("UpdateTimer");
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

	 if(movesCounter === 20){
		 starsCount = 1;
		 toggleStarsOff(1);
	 }

	 if(movesCounter === 24){
		 starsCount = 0;
		 toggleStarsOff(0);
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
