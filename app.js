// get display
const display = document.querySelector("#display");

let displayString = "";
let currentNumbers = [""];
let currentOperation = "";

// basic arithmetic functions
add = (a, b) => a + b;
subtract = (a, b) => a - b;
multiply = (a, b) => a * b;
divide = (a, b) => a / b;

function operate(operation, a, b) {
    // prevent empty decimals from crashing the calculator
    b === "." ? 0 : b;
    switch (operation) {
        case "add":
            return add(+a, +b);
        case "subtract":
            return subtract(+a, +b);
        case "multiply":
            // prevent empty operands from changing the result
            b = +b || 1;
            return multiply(+a,+ b);
        case "divide":
            // snarky error message
            if (b === "0") {
                alert("You're real clever, aren't you?")
            }
            b = +b || 1;
            return divide(+a, +b);
    }
}

function refreshDisplay(wipe=false) {
    if (wipe) displayString = "";
    display.textContent = displayString;
}

const buttonList = document.querySelectorAll(".calculator button");
buttonList.forEach(button => {
    if (button.classList.contains("number")) {
        button.addEventListener("click", e => {
            let number = e.target.textContent;
            // add the number to the display
            displayString += number;
            // concatenate the number to the last operand
            currentNumbers[currentNumbers.length-1] += number;
            refreshDisplay();
            console.log(number);
        })
    } else if (button.classList.contains("operation")) {
        button.addEventListener("click", e => {
            let sign = e.target.textContent;
            let operation = e.target.id;
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
            console.log(operation);
        })
    } else if (button.id === "evaluate") {
        button.addEventListener("click", e => {
            // if an operation is active, evaluate it
            if (currentOperation) {
                let result = operate(currentOperation, ...currentNumbers);
                currentNumbers.splice(0, 2);
                currentNumbers.push(result.toString());
                refreshDisplay(true);
                displayString += result;
            }
            refreshDisplay();
            // reset the active operation
            currentOperation = "";
            console.log(e.target.id);
        })
    } else if (button.id === "backspace") {
        button.addEventListener("click", e => {
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
            console.log(e.target.id);
        })
    } else if (button.id === "decimal") {
        button.addEventListener("click", e => {
            // add decimal point to last operand and display. not that hard
            displayString += ".";
            currentNumbers[currentNumbers.length-1] += ".";
            refreshDisplay();
            console.log(e.target.id);
        })
    }
});
