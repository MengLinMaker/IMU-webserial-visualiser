var port, textEncoder, writableStreamClosed, writer, historyIndex = -1;
const lineHistory = [];

async function connectSerial() {
    try {
        // Prompt user to select any serial port.
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: document.getElementById("baud").value });
        listenToPort();

        textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

        writer = textEncoder.writable.getWriter();
    } catch {
        alert("Serial Connection Failed");
    }
}

async function sendSerialLine() {
    dataToSend = document.getElementById("lineToSend").value;
    lineHistory.unshift(dataToSend);
    historyIndex = -1; // No history entry selected
    if (document.getElementById("addLine").checked == true) dataToSend = dataToSend + "\r\n";
    if (document.getElementById("echoOn").checked == true) appendToTerminal("> " + dataToSend);
    await writer.write(dataToSend);
    document.getElementById("lineToSend").value = "";
    //await writer.releaseLock();
}

async function listenToPort() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    // Listen to data coming from the serial device.
    while (true) {
        const { value, done } = await reader.read();
        // value is a string.
        appendToTerminal(value);
    }
}

const serialResultsDiv = document.getElementById("serialResults");

async function appendToTerminal(newStuff) {
    serialResultsDiv.innerHTML += newStuff;
    if (serialResultsDiv.innerHTML.length > 3000) serialResultsDiv.innerHTML = serialResultsDiv.innerHTML.slice(serialResultsDiv.innerHTML.length - 3000);

    //scroll down to bottom of div
    serialResultsDiv.scrollTop = serialResultsDiv.scrollHeight;
}

function scrollHistory(direction) {
    // Clamp the value between -1 and history length
    historyIndex = Math.max(Math.min(historyIndex + direction, lineHistory.length - 1), -1);
    if (historyIndex >= 0) {
        document.getElementById("lineToSend").value = lineHistory[historyIndex];
    } else {
        document.getElementById("lineToSend").value = "";
    }
}

document.getElementById("baud").value = (localStorage.baud == undefined ? 9600 : localStorage.baud);