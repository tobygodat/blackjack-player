const suits = ["♠","♦","♥","♣"];
const values = ['2','3','4','5','6','7','8','9', '10', 'J','Q','K','A'];

let deck = [];
let player_cards = [];
let dealer_cards = [];

let dealBtn = null;
let hitBtn = null;
let standBtn = null;
let newBtn = null;
let dealer = null;   
let player = null;  
let statusEl = null; 

let inRound = false; 
let dealerHoleEl = null; 

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
    // build a simple card element with top/bottom corners and a center suit.
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

    ctop.classList.add("corner", "top", color);
    ctop.innerHTML = `${card.value}<br>${card.suit}`;

    cardElement.append(ctop, midsuit, cbot);

    if (hidden === true) {

        midsuit.style.visibility = "hidden";
        ctop.style.visibility = "hidden";
        cbot.style.visibility = "hidden";
        cardElement.dataset.hidden = "true";
    }
    return cardElement;
}

function dealing() {
    // start new round -- clear UI & deal new 
    player_cards = [];
    dealer_cards = [];
    dealer.innerHTML = '';
    player.innerHTML = '';
    statusEl.textContent = '';

    // reshuffle if low on cards
    if (deck.length < 15) { 
        makeDeck(); 
        shuffleDeck(deck);
    }

    // Player gets two
    const p1 = deck.pop(); const p2 = deck.pop();
    player_cards.push(p1, p2);
    player.appendChild(displayCard(p1));
    player.appendChild(displayCard(p2));
    // update player total
    updateTotal(player, player_cards, true);

    // dealer dealt one normal & hidden
    const d1 = deck.pop(); const d2 = deck.pop();
    dealer_cards.push(d1, d2);
    dealer.appendChild(displayCard(d1));
    dealerHoleEl = displayCard(d2, true);
    dealer.appendChild(dealerHoleEl);
    // hide total until card is revealed
    updateTotal(dealer, dealer_cards, false);

    inRound = true;
    updateButtons();

    // check for initial bjack
    const pTotal = handTotal(player_cards);
    const dTotal = handTotal(dealer_cards);
    if (pTotal === 21 || dTotal === 21) {
        revealDealerHole();
        endRound(compareTotals());
    }
}

function handTotal(cards) {
    // Count J/Q/K as 10, A as 11 then reduce by 10 while busting and aces remain.
    let sum = 0;
    let aces = 0;
    for (const c of cards) {
        if (c.value === 'A') { 
            sum += 11; 
            aces += 1; 
        }
        else if (['K','Q','J'].includes(c.value)) { 
            sum += 10; 
        }
        else { 
            sum += Number(c.value); 
        }
    }
    while (sum > 21 && aces > 0) { 
        sum -= 10;
        aces -= 1;
    }
    return sum;
}

function getTotalEl(container) {
    // Ensure a .total element exists within the given hand container
    let el = container.querySelector('.total');
    if (!el) {
        el = document.createElement('div');
        el.className = 'total';
        container.appendChild(el);
    }
    return el;
}

function updateTotal(container, cards, revealed) {
    const el = getTotalEl(container);
    el.textContent = revealed ? `Total: ${handTotal(cards)}` : 'Total: ?';
}

function revealDealerHole() {
    if (dealerHoleEl && dealerHoleEl.dataset.hidden === 'true') {
        // reveal cards
        for (const el of dealerHoleEl.children) el.style.visibility = '';
        delete dealerHoleEl.dataset.hidden;
    }
    // show total
    updateTotal(dealer, dealer_cards, true);
}

function playerHit() {
    if (!inRound) return;
    const card = deck.pop();
    player_cards.push(card);
    player.appendChild(displayCard(card));
    // update total
    updateTotal(player, player_cards, true);
    const total = handTotal(player_cards);
    if (total > 21) {
        revealDealerHole();
        endRound('Player busts. Dealer wins.');
    }
}

function dealerPlay() {
    revealDealerHole();
    // hit until 17
    while (handTotal(dealer_cards) < 17) {
        const c = deck.pop();
        dealer_cards.push(c);
        dealer.appendChild(displayCard(c));
        // update totals
        updateTotal(dealer, dealer_cards, true);
    }
}

function compareTotals() {
    const p = handTotal(player_cards);
    const d = handTotal(dealer_cards);
    if (p > 21) return 'Player busts. Dealer wins.';
    if (d > 21) return 'Dealer busts. Player wins!';
    if (p > d) return 'Player wins!';
    if (p < d) return 'Dealer wins.';
    return 'Push (tie).';
}

function endRound(message) {
    inRound = false;
    statusEl.textContent = message;
    
    updateTotal(player, player_cards, true);
    updateTotal(dealer, dealer_cards, true);
    updateButtons();
}

function updateButtons() {  

    dealBtn.disabled = inRound;
    hitBtn.disabled = !inRound;
    standBtn.disabled = !inRound;
    newBtn.disabled = inRound;
}


document.addEventListener("DOMContentLoaded", () => {

    dealBtn = document.getElementById("deal-btn");
    hitBtn = document.getElementById("hit-btn");
    standBtn = document.getElementById("stand-btn");
    newBtn = document.getElementById("new-btn");
    dealer = document.getElementById("dealer-cards");
    player = document.getElementById("player-cards");
    statusEl = document.getElementById("status");

    if (!dealBtn || !hitBtn || !standBtn || !newBtn || !dealer || !player || !statusEl) {
        console.error("Missing required elements");
        return;
    }

    makeDeck();
    shuffleDeck(deck);
    updateButtons();

    dealBtn.addEventListener("click", () => dealing());
    hitBtn.addEventListener("click", () => playerHit());
    standBtn.addEventListener("click", () => { dealerPlay(); endRound(compareTotals()); });
    newBtn.addEventListener("click", () => { inRound = false; statusEl.textContent = ''; dealing(); });
});