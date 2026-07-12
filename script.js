// ================================================================
// COSTANTI CONDIVISE
// ================================================================

// L'area del rettangolo resta sempre uguale a 2.
const AREA = 2;

// Valore esatto verso cui convergono i tentativi.
const TARGET_VALUE = Math.sqrt(AREA);

// Numero massimo di cifre decimali mostrate.
const DECIMAL_PLACES = 5;


// ================================================================
// PRIMA ESPERIENZA: I DUE SEGMENTI
// ================================================================

// Coordinate del disegno dei segmenti.
const SEGMENT_START_X = 130;
const SEGMENT_SCALE = 105;

// Stato indipendente della prima esperienza.
let segmentX = 6;
let segmentStepNumber = 0;

// Elementi HTML e SVG della prima esperienza.
const targetGuide = document.querySelector("#targetGuide");
const targetCaption = document.querySelector("#targetCaption");
const targetSegment = document.querySelector("#targetSegment");
const targetPoint = document.querySelector("#targetPoint");
const targetValueLabel = document.querySelector("#targetValueLabel");

const guessSegment = document.querySelector("#guessSegment");
const guessPoint = document.querySelector("#guessPoint");
const guessValueLabel = document.querySelector("#guessValueLabel");

const segmentStartValue = document.querySelector("#segmentStartValue");
const segmentStepButton = document.querySelector("#segmentStepButton");
const segmentResetButton = document.querySelector("#segmentResetButton");
const segmentGuess = document.querySelector("#segmentGuess");
const segmentStepNumberLabel = document.querySelector("#segmentStepNumberLabel");
const segmentHint = document.querySelector("#segmentHint");


// ================================================================
// SECONDA ESPERIENZA: LA MACCHINA DELLA MEDIA
// ================================================================

// Tutti i segmenti partono da questo punto dell'SVG.
const MACHINE_START_X = 145;

// Trasforma i valori numerici in lunghezze visibili nel disegno.
// Con scala 70 anche il valore iniziale 10 rimane dentro il canvas.
const MACHINE_SCALE = 70;

// Stato indipendente della seconda esperienza.
let machineX = 6;
let machineHasResult = false;

// Elementi SVG della misura troppo grande.
const machineLargeSegment =
  document.querySelector("#machineLargeSegment");
const machineLargePoint =
  document.querySelector("#machineLargePoint");
const machineLargeSvgValue =
  document.querySelector("#machineLargeSvgValue");

// Elementi SVG della misura troppo piccola.
const machineSmallSegment =
  document.querySelector("#machineSmallSegment");
const machineSmallPoint =
  document.querySelector("#machineSmallPoint");
const machineSmallSvgValue =
  document.querySelector("#machineSmallSvgValue");

// Elementi SVG che mostrano il nuovo tentativo nel mezzo.
const machineCanvas = document.querySelector("#machineCanvas");
const machineLargeConnector =
  document.querySelector("#machineLargeConnector");
const machineSmallConnector =
  document.querySelector("#machineSmallConnector");
const machineMiddleCaption =
  document.querySelector("#machineMiddleCaption");
const machineNewSegment =
  document.querySelector("#machineNewSegment");
const machineNewPoint =
  document.querySelector("#machineNewPoint");
const machineNewSvgValue =
  document.querySelector("#machineNewSvgValue");

// Controlli e testi della seconda esperienza.
const machineStartValue =
  document.querySelector("#machineStartValue");
const machineStepButton =
  document.querySelector("#machineStepButton");
const machineResetButton =
  document.querySelector("#machineResetButton");
const machineHint = document.querySelector("#machineHint");

const machineChosenValueLabel = document.querySelector("#machineChosenValueLabel");
const machineChosenValueLabel2 = document.querySelector("#machineChosenValueLabel2");
const machineChosenValueLabel3 = document.querySelector("#machineChosenValueLabel3");
const machineOppositeValueLabel = document.querySelector("#machineOppositeValueLabel");
const machineOppositeValueLabel2 = document.querySelector("#machineOppositeValueLabel2");
const machineMeanLabel = document.querySelector("#machineMeanLabel");
const machineMeanLabel2 = document.querySelector("#machineMeanLabel2");

// ================================================================
// FUNZIONI CONDIVISE
// ================================================================

// Scrive i numeri con la virgola italiana e senza zeri inutili.
function formatNumber(value, decimalPlaces = DECIMAL_PLACES) {
  return Number(value.toFixed(decimalPlaces))
    .toString()
    .replace(".", ",");
}

// Versione adatta al codice LaTeX elaborato da MathJax.
function formatLatexNumber(value, decimalPlaces = DECIMAL_PLACES) {
  return Number(value.toFixed(decimalPlaces))
    .toString()
    .replace(".", "{,}");
}

// Un singolo passaggio del metodo di Newton per la radice di 2.
function newtonStep(x) {
  return (x + AREA / x) / 2;
}

/*
  Aggiorna uno o più numeri dinamici usando MathJax.

  pairs è un elenco di coppie:
  [
    [elementoHTML, valoreNumerico],
    [altroElementoHTML, altroValore]
  ]
*/
async function updateDynamicLatex(pairs, decimalPlaces = DECIMAL_PLACES) {
  const elements = pairs.map(([element]) => element);

  try {
    MathJax.typesetClear(elements);

    for (const [element, value] of pairs) {
      element.textContent = `\\(${formatLatexNumber(value, decimalPlaces)}\\)`;
    }

    await MathJax.typesetPromise(elements);
  } catch (error) {
    /*
      Se MathJax non fosse ancora pronto, i numeri rimangono comunque
      leggibili come testo normale.
    */
    console.error("Errore durante l'aggiornamento di MathJax:", error);

    for (const [element, value] of pairs) {
      element.textContent = formatNumber(value);
    }
  }
}


// ================================================================
// AGGIORNAMENTO DELLA PRIMA ESPERIENZA
// ================================================================

function updateSegmentView() {
  const targetEndX = SEGMENT_START_X + TARGET_VALUE * SEGMENT_SCALE;
  const guessEndX = SEGMENT_START_X + segmentX * SEGMENT_SCALE;

  const targetMiddleX = (SEGMENT_START_X + targetEndX) / 2;
  const guessMiddleX = (SEGMENT_START_X + guessEndX) / 2;

  // Posiziona una volta anche tutti gli elementi del segmento fisso.
  targetGuide.setAttribute("x1", targetEndX);
  targetGuide.setAttribute("x2", targetEndX);

  targetCaption.setAttribute("x", targetEndX);

  targetSegment.setAttribute("x2", targetEndX);
  targetPoint.setAttribute("cx", targetEndX);
  
  targetValueLabel.setAttribute("x", targetMiddleX);

  // Aggiorna il segmento mobile.
  guessSegment.setAttribute("x2", guessEndX);
  guessPoint.setAttribute("cx", guessEndX);

  guessValueLabel.setAttribute("x", guessMiddleX);
  guessValueLabel.textContent = formatNumber(segmentX);

  updateDynamicLatex( 
    [
      [segmentGuess, segmentX],
      [segmentStepNumberLabel, segmentStepNumber],
    ], 
    10
  );

  const error = Math.abs(segmentX - TARGET_VALUE);

  if (error < 0.00001) {
    segmentHint.textContent =
      "Ci siamo: il tentativo coincide quasi perfettamente con la diagonale.";
  } else if (error < 0.1) {
    segmentHint.textContent =
      "I due estremi sembrano ormai nello stesso punto.";
  } else if (error < 0.5) {
    segmentHint.textContent =
      "Ci siamo quasi: resta soltanto una piccola differenza.";
  } else if (segmentX > TARGET_VALUE) {
    segmentHint.textContent =
      "Il tentativo è ancora troppo lungo. Prova a migliorarlo.";
  } else {
    segmentHint.textContent =
      "Il tentativo è ancora troppo corto. Prova a migliorarlo.";
  }
}

function makeSegmentStep() {
  segmentX = newtonStep(segmentX);
  segmentStepNumber += 1;

  updateSegmentView();
}

function resetSegmentExperience() {
  segmentX = Number(segmentStartValue.value);
  segmentStepNumber = 0;

  segmentHint.textContent =
    "Premi il pulsante e guarda il segmento colorato.";

  updateSegmentView();
}


// ================================================================
// AGGIORNAMENTO DELLA SECONDA ESPERIENZA
// ================================================================

// Converte un valore matematico nella coordinata orizzontale dell'SVG.
function machineCoordinate(value) {
  return MACHINE_START_X + value * MACHINE_SCALE;
}

/*
  A partire dal tentativo corrente costruiamo tre valori:
  - una misura troppo grande;
  - una misura troppo piccola;
  - la loro media, cioè il nuovo tentativo.
*/
function getMachineValues(value) {
  const oppositeValue = AREA / value;

  const tooLarge = Math.max(value, oppositeValue);
  const tooSmall = Math.min(value, oppositeValue);
  const newAttempt = (tooLarge + tooSmall) / 2;

  return {
    tooLarge,
    tooSmall,
    newAttempt
  };
}

// Aggiorna posizione e numero di un segmento SVG.
function updateMachineSegment(segment, point, label, value) {
  const endX = machineCoordinate(value);
  const middleX = (MACHINE_START_X + endX) / 2;

  segment.setAttribute("x2", endX);
  point.setAttribute("cx", endX);
  label.setAttribute("x", middleX);
  label.textContent = formatNumber(value);
}

// Mostra la coppia troppo grande/troppo piccola e l'eventuale media.
function updateMachineView() {
  const {
    tooLarge,
    tooSmall,
    newAttempt
  } = getMachineValues(machineX);

  const largeEndX = machineCoordinate(tooLarge);
  const smallEndX = machineCoordinate(tooSmall);
  const newEndX = machineCoordinate(newAttempt);
  const newMiddleX = (MACHINE_START_X + newEndX) / 2;

  updateMachineSegment(
    machineLargeSegment,
    machineLargePoint,
    machineLargeSvgValue,
    tooLarge
  );

  updateMachineSegment(
    machineSmallSegment,
    machineSmallPoint,
    machineSmallSvgValue,
    tooSmall
  );

  // Le linee tratteggiate collegano i due estremi al punto medio.
  machineLargeConnector.setAttribute("x1", largeEndX);
  machineLargeConnector.setAttribute("x2", newEndX);

  machineSmallConnector.setAttribute("x1", smallEndX);
  machineSmallConnector.setAttribute("x2", newEndX);

  machineMiddleCaption.setAttribute("x", newEndX+100);

  // Segmento che rappresenta il nuovo tentativo.
  machineNewSegment.setAttribute("x2", newEndX);
  machineNewPoint.setAttribute("cx", newEndX);
  machineNewSvgValue.setAttribute("x", newMiddleX);
  machineNewSvgValue.textContent = formatNumber(newAttempt);
  

if (machineHasResult) {
  machineCanvas.classList.add("has-result");

  const error = Math.abs(newAttempt - TARGET_VALUE);

  if (error < 0.00001) {
    machineHint.textContent =
      "Le due misure sono ormai quasi uguali.";
  } else if (error < 0.1) {
    machineHint.textContent =
      "Il nuovo tentativo è ormai vicinissimo al risultato.";
  } else {
    machineHint.textContent =
      "Il nuovo tentativo ha migliorato la stima.";
  }
} else {
  machineCanvas.classList.remove("has-result");
}



}

// Calcola e mostra un nuovo punto medio.
function makeMachineStep() {
  const { newAttempt } = getMachineValues(machineX);
  
  machineHasResult = true;

  // Il risultato di questo clic diventa il punto di partenza del prossimo.
  updateMachineView();
  machineX = newAttempt;
}

// Torna al numero scelto nel menu e nasconde il risultato centrale.
function resetMachineExperience() {
  machineX = Number(machineStartValue.value);
  machineHasResult = false;
  updateDynamicLatex( [
    [machineChosenValueLabel, machineX],
    [machineChosenValueLabel2, machineX],
    [machineChosenValueLabel3, machineX],
    [machineOppositeValueLabel, AREA/machineX],
    [machineOppositeValueLabel2, AREA/machineX],
    [machineMeanLabel, 0.5 * (machineX + AREA/machineX)],
    [machineMeanLabel2, 0.5 * (machineX + AREA/machineX)]
  ]);

  machineHint.textContent =
    "Premi il pulsante per vedere comparire il nuovo tentativo.";

  updateMachineView();
}


// ================================================================
// COLLEGAMENTO FRA PULSANTI E FUNZIONI
// ================================================================

// Prima esperienza.
segmentStepButton.addEventListener(
  "click",
  makeSegmentStep
);

segmentResetButton.addEventListener(
  "click",
  resetSegmentExperience
);

segmentStartValue.addEventListener(
  "change",
  resetSegmentExperience
);

// Seconda esperienza.
machineStepButton.addEventListener(
  "click",
  makeMachineStep
);

machineResetButton.addEventListener(
  "click",
  resetMachineExperience
);

machineStartValue.addEventListener(
  "change",
  resetMachineExperience
);

// Disegno iniziale delle due esperienze.
updateSegmentView();
updateMachineView();
