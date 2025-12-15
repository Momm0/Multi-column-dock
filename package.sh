#!/bin/bash

# Name of the extension UUID
UUID="AITwinMinds@gmail.com"
ZIP_NAME="multi-column-dock.zip"

echo "Creating zip package..."
rm -f $ZIP_NAME
zip -r $ZIP_NAME . -x ".git/*" -x ".gitignore" -x "*.sh" -x "node_modules/*" -x "schemas/gschemas.compiled" -x "*.zip"

echo "Package created: $ZIP_NAME"
