"use strict";
console.clear();
const initial_state = {
    cardDeck: [],
    matchedCards: [],
    attempts: 1
};
// Elems
const byId = document.getElementById.bind(document);
const fromEvent = Rx.Observable.fromEvent;
const newGame = byId('newGame');
// Streams
const newGame$ = fromEvent(newGame, 'click');
const gameSequence$ = newGame$
    .startWith(Rx.Observable.empty())
    .flatMapTo(newSequence$())
    .map(cardDeck => ({ type: 'cards', cardDeck }));
// Card interaction streams
const cardClick$ = delegate('#wrapper', 'button', 'click')
    .map(o => o.delegate)
    .filter(elem => !elem.disabled);
const showCard$ = function (elem) {
    const promise = $.Velocity.animate(elem, {
        rotateY: [0.1, 180]
    }, { duration: 500
    });
    elem.disabled = true;
    return Rx.Observable.fromPromise(promise);
};
const hideCard$ = function (elem) {
    const promise = $.Velocity
        .animate(elem, { rotateY: [180, 0.1] }, { duration: 500 });
    elem.disabled = false;
    return Rx.Observable.fromPromise(promise);
};
const cardClickAnimate$ = cardClick$.map(showCard$);
// Card matching streams
const cardClickPairs$ = cardClickAnimate$
    .flatMap(a => a.concatAll())
    .bufferCount(2)
    .share();
const cardClickPairsMatched$ = cardClickPairs$
    .filter(i => i[0].dataset.index === i[1].dataset.index)
    .map(matchedCards => ({ type: 'match', matchedCards }));
const cardClickPairsNoMatch$ = cardClickPairs$
    .filter(i => i[0].dataset.index !== i[1].dataset.index)
    .map(missedCards => ({ type: 'nomatch', missedCards }));
// Main stream
const run$ = Rx.Observable.merge(gameSequence$, cardClickPairsNoMatch$, cardClickPairsMatched$).scan(reducer, initial_state);
run$.subscribe();
/**
  * Helpers
**/
function reducer(state, intent) {
    console.log('intent: ', intent);
    console.log(`reducer type: ${intent.action}`);
    if (intent.type === 'cards')
        state = Object.assign(state, buildCards(state, intent));
    if (intent.type === 'match')
        state = Object.assign(state, match(state, intent));
    if (intent.type === 'nomatch') {
        state = Object.assign(state, noMatch(state, intent));
    }
    console.log('state: ', state);
    return state;
}
function buildCards(state, intent) {
    const elemWrapper = byId('wrapper');
    byId('attempt').innerHTML = state.attempts;
    elemWrapper.innerHTML = '';
    intent.cardDeck.forEach(item => {
        const button = h('button', '', { 'data-index': item.index });
        button.appendChild(h('img', '', { src: item.imgSrc }));
        elemWrapper.appendChild(button);
    });
    return state;
}
function match(state, intent) {
    return {
        matchedCards: state
            .matchedCards
            .concat(intent.matchedCards)
    };
}
function noMatch(state, intent) {
    // 	TODO: DRY up the attempts logic...
    console.log(state, intent, 'these');
    const attempts = state.attempts + 1;
    intent.missedCards.forEach(hideCard$);
    if (attempts > 2) {
        state.matchedCards.forEach(hideCard$);
        byId('attempt').innerHTML = 1;
        return { matchedCards: [], attempts: 1 };
    }
    byId('attempt').innerHTML = attempts;
    return {
        matchedCards: state.matchedCards,
        attempts
    };
}
function delegate(wrapper, selector, eventName) {
    return Rx.Observable.fromEvent(document.querySelector(wrapper), eventName, e => ({ event: e, delegate: e.target.closest(selector) })).filter(x => x.delegate !== null);
}
function newSequence$() {
    const base1_url = 'https://th.bing.com/th/id/R.324b70bf121592bc7ff4c5f8e15bb4cc?rik=ATa6WS%2bovJaokw&pid=ImgRaw&r=0';
    const base2_url = 'https://th.bing.com/th/id/R.04c894c51f70dd24acd59ec5392a1584?rik=HE1%2foeoPjl6OYg&pid=ImgRaw&r=0';
    const base3_url = 'https://media.tenor.com/images/a2ee88c531a0c006ab63b4169ff64f25/tenor.gif';
    const base4_url = 'https://th.bing.com/th/id/R.2da0417a1aa982a007a7cde8bcc00bb2?rik=SLJ6Gmdx8k%2f23Q&pid=ImgRaw&r=0';
    const base5_url = 'https://cdn1.vectorstock.com/i/thumb-large/78/50/lettering-poster-vector-19587850.jpg';
    
    const base_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/130px-Heart_coraz%C3%B3n.svg.png';
    const imageList = [
        `${base1_url}`,
        `${base2_url}`,
        `${base3_url}`,
        `${base4_url}`,
        `${base5_url}`,
        `${base_url}`
    ];
    const solution = Math.round(Math.random() * 7) + 0;
    const solutionSet = [
        [
            2, 1, 3, 4, 5, 2,
            5, 2, 0, 3, 1, 4,
            3, 0, 4, 3, 2, 4
        ],
        [
            5, 3, 0, 3, 2, 4,
            3, 0, 4, 1, 1, 2,
            4, 5, 2, 3, 2, 4
        ],
        [
            2, 0, 5, 2, 5, 3,
            4, 3, 1, 4, 3, 0,
            4, 2, 1, 3, 2, 4
        ],
        [
            3, 2, 1, 2, 0, 4,
            1, 5, 3, 0, 5, 2,
            4, 3, 4, 3, 2, 4
        ],
        [
            3, 2, 1, 3, 0, 4,
            2, 5, 3, 0, 5, 1,
            4, 2, 4, 3, 2, 4
        ],
        [
            2, 4, 5, 2, 5, 3,
            0, 3, 2, 4, 3, 0,
            4, 1, 1, 3, 2, 4
        ],
        [
            2, 4, 5, 2, 1, 3,
            0, 3, 1, 5, 3, 0,
            4, 2, 4, 3, 2, 4
        ],
        [
            3, 2, 5, 2, 4, 4,
            1, 4, 3, 0, 5, 2,
            1, 3, 0, 3, 2, 4
        ]
    ];
    return Rx.Observable
        .of(solutionSet[solution].map(index => ({
        index, imgSrc: imageList[index]
    })));
}
function h(elemName, html = '', attrs = {}) {
    let elem = document.createElement(elemName);
    if (html !== '')
        elem.innerHTML = html;
    Object.keys(attrs)
        .forEach(key => elem.setAttribute(key, attrs[key]));
    return elem;
}

  let contadorClics = 0;
  const miEnlace = document.getElementById('miEnlace');

  function mostrarEnlace() {
    contadorClics++;
    if (contadorClics === 3) {
      miEnlace.style.display = 'block';
    }
  }

  const corazon = document.querySelector('.corazon');
  corazon.addEventListener('click', mostrarEnlace);
