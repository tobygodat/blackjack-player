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
let amtMoney = 500;
let betSize = 0;
let bettingContainer = null;
let betBtnOne = null, betBtnTwo = null, betBtnThree = null, betBtnFour = null, betClearBtn = null;
let winner = null;

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

    if (amtMoney === 0) {
        betSize = 0;
        renderBet();
    }

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

        for (const el of dealerHoleEl.children) el.style.visibility = '';
        delete dealerHoleEl.dataset.hidden;
    }

    updateTotal(dealer, dealer_cards, true);
}

function playerHit() {
    if (!inRound) return;
    const card = deck.pop();
    player_cards.push(card);
    player.appendChild(displayCard(card));

    updateTotal(player, player_cards, true);
    const total = handTotal(player_cards);
    if (total > 21) {
        revealDealerHole();
        winner = "dealer"; 
        endRound('Player busts. Dealer wins.');
    }
}

function dealerPlay() {
    revealDealerHole();

    while (handTotal(dealer_cards) < 17) {
        const c = deck.pop();
        dealer_cards.push(c);
        dealer.appendChild(displayCard(c));

        updateTotal(dealer, dealer_cards, true);
    }
}

function compareTotals() {
    const p = handTotal(player_cards);
    const d = handTotal(dealer_cards);
    if (p > 21) {
        winner = "dealer";
        return 'Player busts. Dealer wins.'; 
    } else if (d > 21)  {
        winner = "player";
        return 'Dealer busts. Player wins!';
    } else if (p > d) {
        winner = "player";
        return "Player wins!";
    } else if (p < d) {
        winner = "dealer";
        return "Dealer wins!";
    } else {
        winner = "push";
        return 'Push (tie).';
    }
}

function endRound(message) {
    inRound = false;
    statusEl.textContent = message;
    
    updateTotal(player, player_cards, true);
    updateTotal(dealer, dealer_cards, true);

    if (winner === "player") {
        amtMoney += betSize;
    } else if (winner === "dealer") {
        amtMoney -= betSize;
    } else {
        amtMoney = amtMoney;
    }

    renderBet();
    updateButtons();
}

function updateButtons() {  
    dealBtn.disabled = inRound;
    hitBtn.disabled = !inRound;
    standBtn.disabled = !inRound;
    newBtn.disabled = inRound;

    const disableBetting = inRound;
    for (const btn of [betBtnOne, betBtnTwo, betBtnThree, betBtnFour, betClearBtn]) {
        if (btn) btn.disabled = disableBetting;
    }
}

function getBetEl(container) {
    if (!container) return null;
    let el = container.querySelector('.bet-amount');
    if (!el) {
        el = document.createElement('div');
        el.className = 'bet-amount';
        container.appendChild(el);
    }
    return el;
}

function renderBet() {
    const el = getBetEl(bettingContainer);
    if (el) el.innerHTML = `Bet: $${betSize} <br> Total: $${amtMoney}`;
}

function addBet(size) {
    if ((betSize + size) <= amtMoney) {
        betSize += size;
    } else {
        betSize = amtMoney;
    }
    renderBet();
}

document.addEventListener("DOMContentLoaded", () => {

    dealBtn = document.getElementById("deal-btn");
    hitBtn = document.getElementById("hit-btn");
    standBtn = document.getElementById("stand-btn");
    newBtn = document.getElementById("new-btn");
    dealer = document.getElementById("dealer-cards");
    player = document.getElementById("player-cards");
    statusEl = document.getElementById("status");
    bettingContainer = document.querySelector('.betting');
    betBtnOne = document.getElementById("bet-btn-1");
    betBtnTwo = document.getElementById("bet-btn-2");
    betBtnThree = document.getElementById("bet-btn-3");
    betBtnFour = document.getElementById("bet-btn-4");
    betClearBtn = document.getElementById("bet-clear");


    if (!dealBtn || !hitBtn || !standBtn || !newBtn || !dealer || !player || !statusEl) {
        console.error("Missing required elements");
        return;
    }

    makeDeck();
    shuffleDeck(deck);
    updateButtons();
    renderBet(); // initialize bet display

    dealBtn.addEventListener("click", () => dealing());
    hitBtn.addEventListener("click", () => playerHit());
    standBtn.addEventListener("click", () => { dealerPlay(); endRound(compareTotals()); });
    // IMPORTANT: pass a callback, don't call addBet immediately
    if (betBtnOne) betBtnOne.addEventListener("click", () => addBet(10));
    if (betBtnTwo) betBtnTwo.addEventListener("click", () => addBet(25));
    if (betBtnThree) betBtnThree.addEventListener("click", () => addBet(50));
    if (betBtnFour) betBtnFour.addEventListener("click", () => addBet(100));
    if (betClearBtn) betClearBtn.addEventListener("click", () => { betSize = 0; renderBet(); });


    newBtn.addEventListener("click", () => { inRound = false; statusEl.textContent = ''; dealing(); });
});