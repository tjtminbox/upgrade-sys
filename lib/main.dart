import 'dart:async';
import 'dart:html' as html;
import 'dart:js' as js;
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Screenshot Auto',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        brightness: Brightness.dark,
      ),
      home: const ScreenCapturePage(),
    );
  }
}

class ScreenCapturePage extends StatefulWidget {
  const ScreenCapturePage({super.key});

  @override
  State<ScreenCapturePage> createState() => _ScreenCapturePageState();
}

class _ScreenCapturePageState extends State<ScreenCapturePage> {
  Timer? _captureTimer;
  final int _captureInterval = 5; // Screenshot interval in seconds
  int _screenshotCount = 0;
  final String _serverUrl = 'https://screenshot-pwa.glitch.me';  // We'll update this after Glitch deployment
  bool _isSafari = false;
  String? _lastScreenshotUrl;

  @override
  void initState() {
    super.initState();
    _checkBrowser();
    _startAutoCapture();
  }

  void _checkBrowser() {
    final userAgent = html.window.navigator.userAgent.toLowerCase();
    setState(() {
      _isSafari = userAgent.contains('safari') && !userAgent.contains('chrome');
    });
    if (_isSafari) {
      debugPrint('Running on Safari - using alternative capture method');
    }
  }

  Future<void> _captureAndSaveScreenshot() async {
    try {
      final timestamp = DateTime.now();
      final formattedTimestamp = "${timestamp.year}${timestamp.month.toString().padLeft(2, '0')}${timestamp.day.toString().padLeft(2, '0')}_${timestamp.hour.toString().padLeft(2, '0')}${timestamp.minute.toString().padLeft(2, '0')}${timestamp.second.toString().padLeft(2, '0')}";
      
      // Show capturing indicator
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Capturing screenshot...'),
          duration: Duration(seconds: 1),
        ),
      );

      // Capture screenshot using JavaScript
      final result = await js.context.callMethod('eval', ['''
        (async function() {
          try {
            const canvas = await window.autoScreenshot.capture();
            const imageData = canvas.toDataURL('image/png');
            
            // Send to server
            const response = await fetch('$_serverUrl/save-screenshot', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
              },
              body: JSON.stringify({
                imageData: imageData,
                timestamp: '$formattedTimestamp',
                browser: '${_isSafari ? "safari" : "chrome"}'
              })
            });
            
            if (!response.ok) {
              throw new Error('Server response was not ok: ' + response.status);
            }
            
            return await response.json();
          } catch (error) {
            console.error('Screenshot error:', error);
            throw error;
          }
        })()
      ''']);

      // Handle the result
      if (result != null) {
        setState(() {
          _screenshotCount++;
          _lastScreenshotUrl = result['url'];
        });
        
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Screenshot saved successfully! Count: $_screenshotCount'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (error) {
      print('Error capturing screenshot: $error');
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to capture screenshot. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _startAutoCapture() {
    _captureTimer?.cancel();
    _captureTimer = Timer.periodic(Duration(seconds: _captureInterval), (_) {
      _captureAndSaveScreenshot();
    });
  }

  @override
  void dispose() {
    _captureTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Screenshot Auto'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_lastScreenshotUrl != null)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text('Last Screenshot:'),
                      const SizedBox(height: 8),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              '$_serverUrl$_lastScreenshotUrl',
                              fit: BoxFit.contain,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 20),
            Text(
              'Screenshots taken: $_screenshotCount',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 20),
            Text(
              'Next capture in: ${_getNextCaptureTime()} seconds',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      ),
    );
  }

  String _getNextCaptureTime() {
    if (_captureTimer == null) return '$_captureInterval';
    return '${(_captureInterval - (_captureTimer!.tick % _captureInterval))}';
  }
}
