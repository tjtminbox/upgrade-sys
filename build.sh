#!/bin/bash
# Exit on error
set -e

echo "Starting build process..."

# Install Flutter
echo "Downloading Flutter..."
git clone https://github.com/flutter/flutter.git --depth 1 -b stable
export PATH="$PATH:`pwd`/flutter/bin"

echo "Running Flutter doctor..."
flutter doctor

echo "Building web app..."
flutter build web --release

echo "Build completed. Output directory: build/web"
