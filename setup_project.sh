#!/bin/bash

# Create directory structure
mkdir -p src styles images lib _locales/en

# Create JavaScript files
touch src/background.js
touch src/content.js
touch src/popup.js

# Create HTML files
mkdir html
touch html/popup.html

# Create CSS files
touch styles/popup.css

# Create image placeholders
touch images/icon16.png
touch images/icon48.png
touch images/icon128.png

# Create library placeholders
touch lib/jquery.min.js

# Create localization files
touch _locales/en/messages.json

# Create the manifest file
cat <<EOF > manifest.json
{
  "manifest_version": 3,
  "name": "Gmail UTM Link Appender",
  "version": "1.0",
  "description": "Automatically appends UTM parameters to links in Gmail.",
  "permissions": ["storage", "activeTab", "scripting", "https://mail.google.com/"],
  "action": {
    "default_popup": "html/popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  },
  "background": {
    "service_worker": "src/background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["src/content.js"]
    }
  ],
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  }
}
EOF

echo "Project setup complete!"
