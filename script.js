const suits = ["spades","diamonds","hearts","clubs"];
const values = ['1','2','3','4','5','6','7','8','9','J','Q','K','A']



let deck = [];
let player_cards = [];
let dealer_cards = [];

const deal = document.getElementById("deal-btn")
const dealer = document.getElementById("dealer-cards")
const player = document.getElementById("player-cards")


// IMPORTANT: pass the function reference, don't call it here
deal.addEventListener("click", () => {
    dealing("dealer");
    dealing("player");
});

function makeDeck() {
    deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ value, suit });
        }
    }
    return deck;
}


function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function displayCard() {
    const cardElement = document.createElement("div");
    cardElement.className = "card";
    return cardElement;
}

function dealing(who) {
    for (let i = 0; i < 2; i++) {
        if (who === "dealer") {
            dealer.appendChild(displayCard());
        } else {
            player.appendChild(displayCard())
        }
    }
}

 