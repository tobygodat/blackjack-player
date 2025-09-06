const suits = ["♠","♦","♥","♣"];
const values = ['2','3','4','5','6','7','8','9', '10', 'J','Q','K','A'];

let deck = [];
let player_cards = [];
let dealer_cards = [];

let deal = null;
let dealer = null;
let player = null;

let dealt_1 = false;

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

function displayCard(card, hidden) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");

    const midsuit = document.createElement("div");
    const cbot = document.createElement("div");
    const ctop = document.createElement("div");

    const color = (card.suit === "♠" || card.suit === "♣") ? "black" : "red";

    midsuit.classList.add("suit", color);
    midsuit.textContent = `${card.suit}`;

    cbot.classList.add("corner", "bottom", color);
    cbot.innerHTML = `${card.value}<br>${card.suit}`;

    ctop.classList.add("corner", "top", color); // ensure "top" class
    ctop.innerHTML = `${card.value}<br>${card.suit}`;

    cardElement.append(ctop, midsuit, cbot);

    if (hidden === true) {
        midsuit.style.visibility = "hidden";
        ctop.style.visibility = "hidden";
        cbot.style.visibility = "hidden";
    }
    return cardElement;
}

function dealing(who) {
    for (let i = 0; i < 2; i++) {
        const card = deck.pop();
        if (!card) return;
        if (who === "dealer") {
            i === 0
                ? dealer.appendChild(displayCard(card, false))
                : dealer.appendChild(displayCard(card, true));
        } else {
            player.appendChild(displayCard(card, false));
        }
    }
}

function total() {
    const cardCont = document.querySelector(".card-container") 
    
    const totalEl = document.createElement("div");

    totalEl.classList.add("total");
    totalEl.textContent = "Total: ";
    cardCont.appendChild(totalEl);
}

// Wait for DOM so IDs resolve
document.addEventListener("DOMContentLoaded", () => {
    deal = document.getElementById("deal-btn");
    dealer = document.getElementById("dealer-cards");
    player = document.getElementById("player-cards");

    if (!deal || !dealer || !player) {
        console.error("Missing required elements: #deal-btn, #dealer-cards, #player-cards");
        return;
    }

    makeDeck();
    shuffleDeck(deck);

    deal.addEventListener("click", () => {
        if (!dealt_1) {
            dealing("dealer");
            dealing("player");
            total();
            dealt_1 = true;
        }
    });
});