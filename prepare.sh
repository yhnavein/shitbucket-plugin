#!/bin/bash

VERSION=$(jq -r '.version' manifest.json)
zip -r shitbucket-v${VERSION}.zip . -x "*.DS_Store" ".gitignore" ".git/*" "*.git*" "*.zip" "*.sh"
