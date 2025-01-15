#!/bin/sh
echo "Starting build process..."

# Download and install Flutter
git clone https://github.com/flutter/flutter.git
export PATH="$PATH:$(pwd)/flutter/bin"
flutter precache
flutter doctor -v

# Build web app
flutter build web --release

# Ensure output directory exists
mkdir -p build/web
