// the maximum amount of decimal places. 8 seemed about right
const DECIMAL_PLACES = 8;

// get display
const display = document.querySelector("#display-text");

let calcState = [""];
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

function refreshDisplay() {
    display.textContent = calcState.join("");
}

function resetState() {
    // clear any variables
    calcState.splice(0, calcState.length);
    calcState.push("");
    currentOperation = "";
    refreshDisplay();
}

// button functions
const buttonFunctions = {
    number(e) {
        // input limit
        if (calcState[calcState.length-1].length === 15) return; 
        
        let number = e.currentTarget.textContent;
        // prevent leading zeros and Infinity
        if (calcState[calcState.length-1] === "0" || calcState[calcState.length-1] === "Infinity") return;

        // concatenate the number to the last operand
        calcState[calcState.length-1] += number;
        refreshDisplay();
        debugLog.push(number);
    },

    operation(e) {
        // check for "-" as an operand, disable buttons until further input is provided
        if (calcState[calcState.length-1] === "-") {
            return;
        }
        let operation = e.currentTarget.id;
        let sign = (operation === "power") ? "^" : e.currentTarget.textContent;
        // special case for inputting negative numbers
        if (operation === "subtract" && calcState[calcState.length-1] === "") {
            calcState[calcState.length-1] += sign;
            refreshDisplay();
            debugLog.push("neg");
            return;
        }
        // if run without the first operand, add a zero
        if (!calcState[0]) {
            calcState[0] = "0";
        }
        // if an operation is active, evaluate it first
        if (currentOperation) {
            let result = operate(currentOperation, calcState[0], calcState[2]);
            calcState.push(result.toString());
            calcState.splice(0, 3);
            refreshDisplay();
        }
        calcState.push(` ${sign} `);
        // set operation as active
        currentOperation = operation;
        // switch to second operand
        calcState.push("")
        refreshDisplay();
        debugLog.push(operation);
    },

    evaluate(e) {
        // if an operation is active, evaluate it
        if (currentOperation) {
            let result = operate(currentOperation, calcState[0], calcState[2]);
            calcState.push(result.toString());
            calcState.splice(0, 3);
            refreshDisplay();
        }

        // properly render the operand upon evaluation
        if (calcState.length === 1) {
            calcState[0] = String(toDecimalPlaces(+calcState[0], DECIMAL_PLACES));
            // 
            if (calcState[0] === "NaN") {
                calcState[0] = "";
            }
        }
        refreshDisplay();
        // reset the active operation
        currentOperation = "";
        debugLog.push("eval");
    },

    backspace(e) {
        // are you deleting an operation?
        if (calcState.length === 3 && calcState[2] === "") {
            calcState.splice(1, 2);
            currentOperation = ""
        } else if (calcState[calcState.length-1] === "Infinity") {
            calcState[calcState.length-1] = "";
        } else {
            // remove the last character of the last operand
            let numberLength = calcState[calcState.length-1].length;
            calcState[calcState.length-1] = calcState[calcState.length-1].slice(0, numberLength-1);
        }
            refreshDisplay();
        debugLog.push("backspace");
    },

    decimal(e) {
        // add decimal point to last operand and display. not that hard
        /* additional check: don't do anything if the last operand already
           contains a decimal point */
        if (!calcState[calcState.length-1].includes(".")) {
            calcState[calcState.length-1] += ".";
            refreshDisplay();
        }
        debugLog.push("decimal");
    },

    clear() {
        resetState();
        debugLog.push("clear");
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
        "p": ["power", "xy"],
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
