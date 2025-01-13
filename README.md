# Screenshot PWA

A Progressive Web Application (PWA) that automatically captures screenshots at regular intervals.

## Features

- Automatic screenshot capture every 5 seconds
- Real-time preview of captured screenshots
- Works in both Chrome and Safari browsers
- Screenshot counter and capture countdown timer
- Server-side storage of screenshots

## Technologies Used

- Frontend:
  - Flutter Web
  - HTML5 Canvas
  - JavaScript (html2canvas)
- Backend:
  - Node.js
  - Express.js

## Prerequisites

- Flutter SDK
- Node.js
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd screenshot_pwa
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Flutter dependencies:
```bash
flutter pub get
```

## Running the Application

1. Start the Node.js server:
```bash
node server.js
```

2. In a separate terminal, run the Flutter web app:
```bash
flutter run -d chrome
```

The application will be available at `http://localhost:3000`

## Project Structure

- `lib/` - Flutter application source code
- `web/` - Web-specific files and assets
- `server.js` - Node.js server implementation
- `screenshots/` - Directory where screenshots are stored

## License

MIT License
