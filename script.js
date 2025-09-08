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
// Running count (Hi-Lo) & session controls
let runningCount = 0;
let countVisible = false;
let countValueEl = null;
let toggleCountBtn = null;
let bankrollInput = null;
let setBankrollBtn = null;
let dealerHoleCard = null;
let dealerHoleCounted = false;
let endSessionBtn = null;
let resetSessionBtn = null;
let startingBankroll = 500;
let hasSubmitted = false;

function hiLoValue(card) {
    if (!card) return 0;
    const v = card.value;
    if (['2','3','4','5','6'].includes(v)) return 1;
    if (['7','8','9'].includes(v)) return 0;
    return -1;
}

function applyCountForCard(card) {
    runningCount += hiLoValue(card);
    updateCountUI();
}

function updateCountUI() {
    if (!countValueEl) return;
    countValueEl.textContent = countVisible ? String(runningCount) : '—';
    if (toggleCountBtn) toggleCountBtn.textContent = countVisible ? 'Hide Count' : 'Show Count';
}

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
    player_cards = [];
    dealer_cards = [];
    dealer.innerHTML = '';
    player.innerHTML = '';
    statusEl.textContent = '';
    dealerHoleEl = null;
    dealerHoleCard = null;
    dealerHoleCounted = false;

    if (deck.length < 15) { 
        makeDeck(); 
        shuffleDeck(deck);
        runningCount = 0;
        updateCountUI();
    }

    const p1 = deck.pop(); const p2 = deck.pop();
    player_cards.push(p1, p2);
    player.appendChild(displayCard(p1));
    player.appendChild(displayCard(p2));

    applyCountForCard(p1); applyCountForCard(p2);

    updateTotal(player, player_cards, true);

    const d1 = deck.pop(); const d2 = deck.pop();
    dealer_cards.push(d1, d2);
    dealer.appendChild(displayCard(d1));
    dealerHoleEl = displayCard(d2, true);
    dealer.appendChild(dealerHoleEl);
    dealerHoleCard = d2; 
    applyCountForCard(d1);

    updateTotal(dealer, dealer_cards, false);

    inRound = true;
    updateButtons();

    if (amtMoney === 0) {
        betSize = 0;
        renderBet();
    }

    const pTotal = handTotal(player_cards);
    const dTotal = handTotal(dealer_cards);
    if (pTotal === 21 || dTotal === 21) {
        revealDealerHole();
        endRound(compareTotals());
    }
}

function handTotal(cards) {

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

    if (!dealerHoleCounted && dealerHoleCard) {
        applyCountForCard(dealerHoleCard);
        dealerHoleCounted = true;
    }

    updateTotal(dealer, dealer_cards, true);
}

function playerHit() {
    if (!inRound) return;
    const card = deck.pop();
    player_cards.push(card);
    player.appendChild(displayCard(card));
    applyCountForCard(card);

    updateTotal(player, player_cards, true);
    const total = handTotal(player_cards);
    
    if (total > 21) {
        revealDealerHole();
        winner = "dealer"; 
        endRound('Player busts. Dealer wins.');
        if (betSize >= amtMoney) {
        betSize = amtMoney;
        renderBet();
    }
    }
}

function dealerPlay() {
    revealDealerHole();

    while (handTotal(dealer_cards) < 17) {
        const c = deck.pop();
        dealer_cards.push(c);
        dealer.appendChild(displayCard(c));
    applyCountForCard(c);

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
        if (player_cards.length === 2 && handTotal(player_cards) === 21) {
            amtMoney += Math.floor(betSize * 1.5);
        } else {
            amtMoney += betSize;
        }
    } else if (winner === "dealer") {
        amtMoney -= betSize;
    }

    renderBet();
    updateButtons();

    if (amtMoney <= 0) {
        statusEl.textContent = "Game Over! You're out of money.";
    }
}

function updateButtons() {  
    dealBtn.disabled = inRound;
    hitBtn.disabled = !inRound;
    standBtn.disabled = !inRound;
    newBtn.disabled = inRound;
    if (setBankrollBtn) setBankrollBtn.disabled = inRound;

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

    countValueEl = document.getElementById('count-value');
    toggleCountBtn = document.getElementById('toggle-count-btn');
    bankrollInput = document.getElementById('bankroll-input');
    setBankrollBtn = document.getElementById('set-bankroll-btn');
    endSessionBtn = document.getElementById('end-session-btn');
    resetSessionBtn = document.getElementById('reset-session-btn');


    if (!dealBtn || !hitBtn || !standBtn || !newBtn || !dealer || !player || !statusEl) {
        console.error("Missing required elements");
        return;
    }

    makeDeck();
    shuffleDeck(deck);
    updateButtons();
    renderBet(); 
    runningCount = 0; 
    updateCountUI();

    if (bankrollInput) {
        const initial = parseInt(bankrollInput.value, 10);
        if (!Number.isNaN(initial) && initial >= 0) {
            amtMoney = initial;
            startingBankroll = initial;
            hasSubmitted = false;
            betSize = 0;
            renderBet();
        }
    }

    dealBtn.addEventListener("click", () => dealing());
    hitBtn.addEventListener("click", () => playerHit());
    standBtn.addEventListener("click", () => { dealerPlay(); endRound(compareTotals()); });

    if (betBtnOne) betBtnOne.addEventListener("click", () => addBet(10));
    if (betBtnTwo) betBtnTwo.addEventListener("click", () => addBet(25));
    if (betBtnThree) betBtnThree.addEventListener("click", () => addBet(50));
    if (betBtnFour) betBtnFour.addEventListener("click", () => addBet(100));
    if (betClearBtn) betClearBtn.addEventListener("click", () => { betSize = 0; renderBet(); });

    if (toggleCountBtn) {
        toggleCountBtn.addEventListener('click', () => {
            countVisible = !countVisible;
            updateCountUI();
        });
    }

    if (setBankrollBtn && bankrollInput) {
        setBankrollBtn.addEventListener('click', () => {
            if (inRound) return; 
            const val = parseInt(bankrollInput.value, 10);
            if (!Number.isNaN(val) && val >= 0) {
                amtMoney = val;
                startingBankroll = val;
                hasSubmitted = false;
                betSize = Math.min(betSize, amtMoney);
                renderBet();
            }
        });
    }

    if (endSessionBtn) {
        endSessionBtn.addEventListener('click', async () => {
            if (hasSubmitted) return;
            if (inRound) {
                dealerPlay();
                endRound(compareTotals());
            }
            try {
                await submitScore(amtMoney);
                hasSubmitted = true;
                statusEl.textContent = `Session ended. Final bankroll submitted: $${amtMoney}`;
            } catch (e) {
                console.error('Submit failed', e);
            }
        });
    }

    if (resetSessionBtn) {
        resetSessionBtn.addEventListener('click', () => {
            inRound = false;
            winner = null;
            player_cards = [];
            dealer_cards = [];
            amtMoney = startingBankroll;
            betSize = 0;
            statusEl.textContent = 'Session reset.';
            
            makeDeck();
            shuffleDeck(deck);
            runningCount = 0;
            updateCountUI();

            dealer.innerHTML = '';
            player.innerHTML = '';
            renderBet();
            updateButtons();
        });
    }

    newBtn.addEventListener("click", () => { inRound = false; statusEl.textContent = ''; dealing(); });
    getAndDisplayLeaderboard();
});


const API_URL = 'http://localhost:8080';

async function getAndDisplayLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    const leaderboard = await response.json();

    const leaderboardListEl = document.getElementById('leaderboard-list');
    if (!leaderboardListEl) return;

    leaderboardListEl.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardListEl.textContent = 'No scores yet. Be the first!';
        return;
    }

    const ol = document.createElement('ol');
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: $${entry.score}`;
        ol.appendChild(li);
    });
    leaderboardListEl.appendChild(ol);

  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    const leaderboardListEl = document.getElementById('leaderboard-list');
    if(leaderboardListEl) leaderboardListEl.textContent = "Could not load leaderboard.";
  }
}

async function submitScore(finalBankroll) {
  try {
    const playerName = prompt("Game over! Enter your name for the leaderboard:");
    if (!playerName) return;

    await fetch(`${API_URL}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: playerName, score: finalBankroll }),
    });

    getAndDisplayLeaderboard();
  } catch (error) {
    console.error("Failed to submit score:", error);
  }
}