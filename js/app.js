const deck = document.querySelector('.deck');
const scorePanel = document.querySelector('.score-panel');
const numMovesSpan = document.querySelector('.moves');
const restartButton = document.querySelector('.restart');
const cards = [];
const openCards = [];

deck.addEventListener('click', function(event){
  let cardClicked;
  // Check to see if a card has been clicked
  if(event.target.nodeName == "LI"){ // Card area is clicked
    cardClicked = event.target;
  } else if(event.target.nodeName == "I"){ // Shown card icon is clicked
    cardClicked = event.target.parentElement;
  }else return; // Empty deck area clicked

  toggleShowCard(cardClicked);
  // Add the card to the openCards list
  addToOpenList(cardClicked);
});

function toggleShowCard(card){
  card.classList.toggle('show');
  card.classList.toggle('open');
}

function addToOpenList(card){
  if(openCards.length < 2) openCards.push(card);
}

function createArrayOfCards(){
  // Hardcoded 8 types of cards for a 16 card game
  const cardTypes = ["fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bolt",
  "fa-cube", "fa-leaf","fa-bicycle", "fa-bomb"];

  // Add two of each card to the array of cards
  for(let i = 0; i < cardTypes.length; i++){
    cards.push(createCard(cardTypes[i]));
    cards.push(createCard(cardTypes[i]));
  }
}

function createCard(cardTypesText){
  console.log(cardTypesText);
  var cardElement = document.createElement("li");
  cardElement.classList.add('card');

  var innerImage = document.createElement("i");
  innerImage.classList.add('fa');
  innerImage.classList.add(cardTypesText);
  cardElement.appendChild(innerImage);

  return cardElement;
}

 function gameInit(){
   shuffle(cards);
   deck.innerHTML = "";
   // Fill the deck with the newly shuffled cards
   for(let i = 0; i < cards.length; i++){
     deck.appendChild(cards[i]);
   }

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


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

createArrayOfCards();
gameInit();
