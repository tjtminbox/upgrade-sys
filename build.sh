#!/bin/sh
# Exit on error
set -e

echo "Starting build process..."

# Install Flutter
echo "Downloading Flutter..."
sudo mkdir -p /opt/flutter
sudo chown -R $(whoami) /opt/flutter
git clone https://github.com/flutter/flutter.git --depth 1 -b stable /opt/flutter
export PATH="$PATH:/opt/flutter/bin"

echo "Running Flutter doctor..."
flutter doctor -v

echo "Building web app..."
flutter build web --release

echo "Build completed. Output directory: build/web"
