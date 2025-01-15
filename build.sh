#!/bin/bash
set -ex

echo "Starting build process..."

# Install system dependencies
apt-get update && apt-get install -y wget xz-utils

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
flutter config --enable-web
flutter build web --release

echo "Build completed. Output directory: build/web"
