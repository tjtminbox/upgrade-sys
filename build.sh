#!/bin/bash
set -e

echo "Starting build process..."

# Create temp directory for Flutter
FLUTTER_DIR="/tmp/flutter"
mkdir -p "$FLUTTER_DIR"
cd "$FLUTTER_DIR"

# Download and install Flutter
echo "Downloading Flutter..."
wget -q https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.5-stable.tar.xz
tar xf flutter_linux_3.16.5-stable.tar.xz
export PATH="$PATH:$FLUTTER_DIR/flutter/bin"

# Return to project directory
cd -

echo "Running Flutter doctor..."
flutter doctor -v

echo "Building web app..."
flutter build web --release

# Ensure output directory exists
mkdir -p build/web

echo "Build completed. Output directory: build/web"
