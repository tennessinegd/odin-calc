// the maximum amount of decimal places. 8 seemed about right
const DECIMAL_PLACES = 8;

// get display
const display = document.querySelector("#display-text");

let displayString = "";
let currentNumbers = [""];
let currentOperation = "";

// a way to easily debug without clogging up the console
let debugLog = [];

// basic arithmetic functions
add = (a, b) => a + b;
subtract = (a, b) => a - b;
multiply = (a, b) => a * b;
divide = (a, b) => a / b;
power = (a, b) => a ** b;

// round the number down to n decimal places
function toDecimalPlaces(number, n) {
    let power = 10**n;
    return Math.round(number * power) / power;
}

function operate(operation, a, b) {
    // prevent empty decimals from crashing the calculator
    b === "." ? 0 : b;
    switch (operation) {
        case "add":
            return toDecimalPlaces(add(+a, +b), DECIMAL_PLACES);
        case "subtract":
            return toDecimalPlaces(subtract(+a, +b), DECIMAL_PLACES);
        case "multiply":
            // prevent empty operands from changing the result
            b = b === "" ? 1 : b;
            return toDecimalPlaces(multiply(+a,+ b), DECIMAL_PLACES);
        case "divide":
            // snarky error message
            if (b === "0") {
                alert("You're real clever, aren't you?");
            }
            // empty operands or zero will simply do nothing
            b = +b || 1;
            return toDecimalPlaces(divide(+a, +b), DECIMAL_PLACES);
        case "power":
            b = b === "" ? 1 : b;
            let result = power(+a, +b);
            if (Number.isNaN(result)) {
                alert("That's a complex number!");
                resetState();
            }
            return toDecimalPlaces(result, DECIMAL_PLACES);
    }
}

function refreshDisplay(wipe=false) {
    if (wipe) displayString = "";
    display.textContent = displayString;
}

function resetState() {
    // clear any variables
    currentNumbers.splice(0, currentNumbers.length);
    currentNumbers.push("");
    currentOperation = "";
    refreshDisplay(true);
}

// button functions
const buttonFunctions = {
    number(e) {
        let number = e.currentTarget.textContent;
        // add the number to the display
        displayString += number;
        // concatenate the number to the last operand
        currentNumbers[currentNumbers.length-1] += number;
        refreshDisplay();
        debugLog.push(number);
    },

    operation(e) {
        // check for "-" as an operand, disable buttons until further input is provided
        if (currentNumbers[currentNumbers.length-1] === "-") {
            return;
        }
        let operation = e.currentTarget.id;
        let sign = (operation === "power") ? "^" : e.currentTarget.textContent;
        // special case for inputting negative numbers
        if (operation === "subtract" && currentNumbers[currentNumbers.length-1] === "") {
            displayString += sign;
            currentNumbers[currentNumbers.length-1] += sign;
            refreshDisplay();
            debugLog.push("neg");
            return;
        }
        // if run without the first operand, add a zero
        if (!currentNumbers[0]) {
            displayString += 0;
        }
        // if an operation is active, evaluate it first
        if (currentOperation) {
            let result = operate(currentOperation, ...currentNumbers);
            currentNumbers.push(result.toString());
            currentNumbers.splice(0, 2);
            refreshDisplay(true);
            displayString += result;
        }
        displayString += sign;
        // set operation as active
        currentOperation = operation;
        // switch to second operand
        currentNumbers.push("")
        refreshDisplay();
        debugLog.push(operation);
    },

    evaluate(e) {
        // if an operation is active, evaluate it
        if (currentOperation) {
            let result = operate(currentOperation, ...currentNumbers);
            currentNumbers.splice(0, 2);
            currentNumbers.push(result.toString());
            refreshDisplay(true);
            displayString += result;
        }

        // properly render the operand upon evaluation
        if (currentNumbers.length === 1) {
            currentNumbers[0] = String(toDecimalPlaces(+currentNumbers[0], DECIMAL_PLACES));
            // 
            if (currentNumbers[0] === "NaN") {
                currentNumbers[0] = "";
            }
            displayString = currentNumbers[0];
        }
        refreshDisplay();
        // reset the active operation
        currentOperation = "";
        debugLog.push(e.currentTarget.id);
    },

    backspace(e) {
        // was the operand erased or was it empty beforehand?
        let myFault = false;
        if (currentNumbers.length) {
            // check if the operand was already empty
            let isOperandEmpty = (currentNumbers[currentNumbers.length-1].length === 0)
            // remove the last character of the last operand
            let numberLength = currentNumbers[currentNumbers.length-1].length;
            currentNumbers[currentNumbers.length-1] = currentNumbers[currentNumbers.length-1].slice(0, numberLength-1);
            // if the operand wasn't empty before and is now, that's myFault
            if (!isOperandEmpty && currentNumbers[currentNumbers.length-1].length === 0) myFault = true;
        }
        let displayLength = displayString.length;
        if (displayLength) displayString = displayString.slice(0, displayLength-1);

        // if the operand was already empty and the first operand exists, that means an operation was deleted
        // if an operation was deleted, pop the excess operand and reset the operation
        if (!currentNumbers[2] && currentNumbers.length > 1 && !myFault) {
            currentOperation = ""
            currentNumbers.pop()
        }

        refreshDisplay();
        debugLog.push(e.currentTarget.id);
    },

    decimal(e) {
        // add decimal point to last operand and display. not that hard
        /* additional check: don't do anything if the last operand already
           contains a decimal point */
        if (!currentNumbers[currentNumbers.length-1].includes(".")) {
            displayString += ".";
            currentNumbers[currentNumbers.length-1] += ".";
            refreshDisplay();
        }
        debugLog.push(e.currentTarget.id);
    },

    clear() {
        resetState();
    }
}


const buttonList = document.querySelectorAll(".calculator button");
buttonList.forEach(button => {
    button.addEventListener("click", buttonFunctions[button.classList[0] || button.id]);
});

document.querySelector("body").addEventListener("keydown", e => {
    let action = e.key;
    const keyMapping = {
        "0": "#0",
        "1": "#1",
        "2": "#2",
        "3": "#3",
        "4": "#4",
        "5": "#5",
        "6": "#6",
        "7": "#7",
        "8": "#8",
        "9": "#9",
        "+": ["add", "+"],
        "-": ["subtract", "-"],
        "*": ["multiply", "×"],
        "x": ["multiply", "×"],
        "×": ["multiply", "×"],
        "/": ["divide", "÷"],
        "÷": ["divide", "÷"],
        "^": ["power", "xy"],
        "=": "evaluate",
        "Enter": "evaluate",
        "Backspace": "backspace",
        ".": "decimal",
        ",": "decimal"
    };

    if (!(action in keyMapping)) return;
    if (keyMapping[action].includes("#")) {
        buttonFunctions.number({currentTarget: {textContent: keyMapping[action][1]}});
    } else if (Array.isArray(keyMapping[action])) {
        buttonFunctions.operation({currentTarget: {id: keyMapping[action][0], textContent: keyMapping[action][1]}});
    } else {
        buttonFunctions[keyMapping[action]]();
    }
});