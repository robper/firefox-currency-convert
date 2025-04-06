// Create a floating conversion box element
const conversionBox = document.createElement('div');
conversionBox.style.cssText = `
  position: absolute;
  background: #ffffff;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 10000;
  display: none;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 150px;
`;

document.body.appendChild(conversionBox);

// Function to get the position of the selected text
function getSelectionPosition() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  return {
    top: rect.bottom + window.scrollY + 5,
    left: rect.left + window.scrollX
  };
}

// Function to hide the conversion box
function hideConversionBox() {
  conversionBox.style.display = 'none';
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    // Visual feedback
    conversionBox.style.backgroundColor = '#e8f5e9';
    setTimeout(() => {
      conversionBox.style.backgroundColor = '#ffffff';
    }, 200);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

// Function to position and show the conversion box
function showConversionBox(message, position) {
  conversionBox.textContent = message;
  conversionBox.style.display = 'block';
  conversionBox.style.top = `${position.top}px`;
  conversionBox.style.left = `${position.left}px`;
}

// Add click event listener to the conversion box
conversionBox.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent the document click from hiding the box
  const convertedAmount = conversionBox.textContent.split('=')[1].trim();
  copyToClipboard(convertedAmount);
});

// Add click event listener to the document
document.addEventListener('click', (event) => {
  // Check if the click is outside the conversion box
  if (!conversionBox.contains(event.target)) {
    hideConversionBox();
  }
});

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  const position = getSelectionPosition();
  if (!position) return;

  if (message.type === "showConversion") {
    showConversionBox(`${message.original} = ${message.converted}`, position);
    conversionBox.style.borderColor = "#4CAF50";
    conversionBox.style.backgroundColor = "#ffffff";
  } else if (message.type === "showError") {
    showConversionBox(message.message, position);
    conversionBox.style.borderColor = "#f44336";
    conversionBox.style.backgroundColor = "#ffebee";
  }
}); 