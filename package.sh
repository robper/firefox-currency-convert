#!/bin/bash

# Create a temporary directory
mkdir -p temp_extension

# Copy all necessary files
cp manifest.json background.js content.js popup.js popup.html temp_extension/
cp icons/icon.png temp_extension/
cp -r icons temp_extension/icons

# Create the ZIP file
cd temp_extension
zip -r ../firefox-currency-converter.xpi *

# Clean up
cd ..
rm -rf temp_extension

echo "Extension packaged successfully as firefox-currency-converter.xpi" 