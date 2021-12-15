const d = document;
const gameContainer = d.getElementById("game-container");
const failElement = d.getElementById("fails-text");
const pointsElement = d.getElementById("points-element");
const comboElement = d.getElementById("combo-element");
const scoreBoardElememt = d.getElementById("scoreboard-element");
const modalElement = d.getElementById("modal");
const formElement = d.getElementById("form");

const modalWinElement = d.getElementById("modal-win");
const modalRestartElement = d.getElementById("modal-restart");

let allCards;
let firstSelection = undefined;
let secondSelection = undefined;
let fails = 0;
let canPlay = false;
let combo = 1;
let points = 0;
const ranking = [];
const ls = localStorage;
let rankingData = ls.getItem("rankingData");
let user = "";
let totalCards = 6;

const sortRankignData = () =>
  JSON.parse(rankingData).sort((a, b) => b.points - a.points);

const drawRanking = (rankingData) => {
  rankingData = sortRankignData();
  scoreBoardElememt.textContent = "";

  const fragment = d.createDocumentFragment();
  const dataField = d.createElement("p");
  for (position of rankingData) {
    const data = dataField.cloneNode();
    data.textContent = `${position.name} - ${position.points}`;
    fragment.appendChild(data);
  }
  scoreBoardElememt.appendChild(fragment);
};

const getDataFromLocalStorage = () => {
  if (!rankingData) {
    ls.setItem("rankingData", JSON.stringify(ranking));
  }
};

const saveUserData = (name, points) => {
  const newDataForLocalStorage = { name, points };
  rankingData = ls.getItem("rankingData");
  const oldLocalStorage = JSON.parse(rankingData);
  const newData =
    oldLocalStorage === [] || oldLocalStorage === null
      ? [newDataForLocalStorage]
      : [...oldLocalStorage, newDataForLocalStorage];
  ls.setItem("rankingData", JSON.stringify(newData));
  rankingData = ls.getItem("rankingData");
  drawRanking(newData);
};

const showAllCards = (allCardsElement) => {
  allCardsElement.forEach((card) => {
    card.classList.add("card--show");
  });
};

const hideAllCards = (allCardsElement) => {
  allCardsElement.forEach((card) => {
    card.classList.remove("card--show");
  });
  canPlay = true;
};

const drawCard = (allCards) => {
  gameContainer.textContent = "";

  const fragment = d.createDocumentFragment();

  allCards.forEach((cardNumber) => {
    const card = d.createElement("div");
    card.classList.add("card");
    card.dataset.id = cardNumber;
    card.dataset.pokewin = false;

    const cardBack = d.createElement("div");
    cardBack.classList.add("card__back");
    card.appendChild(cardBack);

    const cardFront = d.createElement("div");
    cardFront.classList.add("card__front");

    const cardImage = d.createElement("img");
    cardImage.src = `assets/images/png/${cardNumber}.png`;
    cardImage.classList.add("card__img");
    cardFront.appendChild(cardImage);
    card.appendChild(cardFront);

    fragment.appendChild(card);
  });

  gameContainer.appendChild(fragment);

  const allCardsElement = d.querySelectorAll(".card");

  setTimeout(() => showAllCards(allCardsElement), 1000);
  setTimeout(() => hideAllCards(allCardsElement), 4000);
  getDataFromLocalStorage();
};

const getRamdomNumbe = (max = 149) => Math.floor(Math.random() * max + 1);

const generatePokeCards = () => {
  const currentCards = [
    ...new Set(Array.from({ length: totalCards }).map(() => getRamdomNumbe())),
  ];

  /*   while (currentCards.length < 9) {
    currentCards = [...new Set([...currentCards, getRamdomNumbe])];
  } */
  allCards = [...currentCards, ...currentCards].sort(() => Math.random() - 0.5);

  currentCards.length < totalCards ? generatePokeCards() : drawCard(allCards);
};

const hidePokeCard = (a, b) => {
  a.classList.remove("card--show");
  b.classList.remove("card--show");
};

const checkPokeWin = () => {
  const countPokeWin = d.querySelectorAll('.card[data-pokewin= "true"]');
  if (countPokeWin.length === totalCards * 2) {
    saveUserData(user, points);
    modalWinElement.classList.add("modal-win--show");
    canPlay = false;
  }
};

const setPoints = (error = false) => {
  if (!error) {
    points = points + combo * 10;
    combo = combo + 1;
    pointsElement.textContent = `Total poinst:${points}`;
  } else {
    combo = 1;
    fails = fails + 1;
    failElement.textContent = `Fails: ${fails}`;
  }
};

const setCardSelected = (firstElementSelected, secondElementSelected) => {
  if (firstElementSelected.dataset.id === secondElementSelected.dataset.id) {
    firstElementSelected.dataset.pokewin = true;
    secondElementSelected.dataset.pokewin = true;
    setPoints();
    checkPokeWin();
  } else {
    secondElementSelected.addEventListener(
      "transitionend",
      () => hidePokeCard(firstElementSelected, secondElementSelected),
      { once: true }
    );
    setPoints(true);
  }
  firstSelection = undefined;
  secondSelection = undefined;
  comboElement.textContent = `X ${combo}`;
};

gameContainer.addEventListener("click", (e) => {
  if (canPlay) {
    if (
      e.target.parentElement.classList.contains("card") &&
      e.target.parentElement.dataset.pokewin === "false"
    ) {
      e.target.parentElement.classList.add("card--show");
      if (firstSelection === undefined) {
        firstSelection = e.target.parentElement;
      } else {
        if (firstSelection !== e.target.parentElement) {
          secondSelection = e.target.parentElement;
          setCardSelected(firstSelection, secondSelection);
        }
      }
    }
  }
});

formElement.addEventListener("submit", (e) => {
  e.preventDefault();
  user = e.target.name.value;
  formElement.remove();
  generatePokeCards();
  modalElement.classList.remove("modal--show");
  drawRanking(JSON.parse(rankingData));
});

modalRestartElement.addEventListener("click", () => {
  generatePokeCards();
  modalWinElement.classList.remove("modal-win--show");
});

window.addEventListener("load", () => {
  getDataFromLocalStorage();
  modalElement.classList.add("modal--show");
});
