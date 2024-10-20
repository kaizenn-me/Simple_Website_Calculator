window.addEventListener('load', initApp);

function initApp() {
    setupButtonActions();
    initializeServiceWorker();
}

function setupButtonActions() {
    assignDigitButtonActions();
    assignOperatorButtonActions();
    assignParenthesesButtonActions();

    // Manual action assignments
    setupEvent("AC", clearAll);
    setupEvent("DEL", removeLastChar);
    setupEvent("dbl0", () => { pushNumber(0); pushNumber(0); });
    setupEvent("PERIOD", addDecimalPoint);
    setupEvent("SBMT", performCalculation);
}

let primaryDisplay = getElementById("primEntry"),
    secondaryDisplay = getElementById("secEntry");

function getElementById(id) {
    return document.getElementById(id);
}

function clearAll() {
    primaryDisplay.innerHTML = "0";
    secondaryDisplay.innerHTML = "";
    openParenthesesCount = 0;
}

function removeLastChar() {
    let displayText = primaryDisplay.innerHTML,
        lastChar = displayText.slice(-1);

    if (lastChar === "(") openParenthesesCount--;

    primaryDisplay.innerHTML = displayText.slice(0, -1) || "0";
}

function pushNumber(num) {
    if (primaryDisplay.innerHTML === "0") {
        primaryDisplay.innerHTML = num;
    } else {
        primaryDisplay.innerHTML += num;
    }
}

function pushOperator(operator) {
    const operators = ['.', '+', '-', 'x', '÷'];
    const lastChar = primaryDisplay.innerHTML.slice(-1);

    if (!operators.includes(lastChar)) {
        if (primaryDisplay.innerHTML === "0" && ['+', '-'].includes(operator)) {
            primaryDisplay.innerHTML = operator;
        } else {
            primaryDisplay.innerHTML += operator;
        }
    }
}

function addDecimalPoint() {
    if (!primaryDisplay.innerHTML.includes('.')) {
        primaryDisplay.innerHTML += '.';
    }
}

let openParenthesesCount = 0;
function pushParentheses(type) {
    const validChars = ['.', '+', '-', 'x', '÷', '('];
    const lastChar = primaryDisplay.innerHTML.slice(-1);

    if (type === "open" && validChars.includes(lastChar)) {
        openParenthesesCount++;
        primaryDisplay.innerHTML += "(";
    } else if (type === "open" && primaryDisplay.innerHTML === "0") {
        openParenthesesCount++;
        primaryDisplay.innerHTML = "(";
    } else if (type === "close" && openParenthesesCount > 0) {
        openParenthesesCount--;
        primaryDisplay.innerHTML += ")";
    }
}

function performCalculation() {
    let expression = primaryDisplay.innerHTML;

    while (openParenthesesCount > 0) {
        expression += ")";
        openParenthesesCount--;
    }

    secondaryDisplay.innerHTML = `${expression}=`;
    expression = expression.replace(/÷/g, '/').replace(/x/g, '*');

    try {
        primaryDisplay.innerHTML = eval(expression);
    } catch (error) {
        primaryDisplay.innerHTML = "Error";
    }
}

function assignDigitButtonActions() {
    const digitButtons = Array.from(document.getElementsByClassName('num'));

    digitButtons.forEach(button => {
        button.addEventListener("click", () => pushNumber(button.innerHTML));
    });
}

function assignOperatorButtonActions() {
    const operatorButtons = Array.from(document.getElementsByClassName("operators"));

    operatorButtons.forEach(button => {
        button.addEventListener("click", () => pushOperator(button.innerHTML));
    });
}

function assignParenthesesButtonActions() {
    setupEvent("openParentheses", () => pushParentheses("open"));
    setupEvent("closeParentheses", () => pushParentheses("close"));
}

function setupEvent(id, handler) {
    getElementById(id).addEventListener("click", handler);
}

async function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (error) {
            console.error(`ServiceWorker registration failed: ${error}`);
        }
    }
}