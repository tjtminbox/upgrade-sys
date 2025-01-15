#!/bin/bash
# Install Flutter
git clone https://github.com/flutter/flutter.git
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
flutter channel stable
flutter upgrade

# Build the web app
flutter build web --release

# The build output will be in the build/web directory
