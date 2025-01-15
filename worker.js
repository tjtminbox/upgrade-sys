// KV namespace will be bound to SCREENSHOTS
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // List all screenshots
    if (path === "/api/screenshots" && request.method === "GET") {
      const screenshots = [];
      const keys = await env.SCREENSHOTS.list();
      
      for (const key of keys.keys) {
        const metadata = await env.SCREENSHOTS.get(key.name, { type: "json" });
        screenshots.push({
          id: key.name,
          ...metadata
        });
      }

      return new Response(JSON.stringify(screenshots), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Save a screenshot
    if (path === "/api/screenshots" && request.method === "POST") {
      const data = await request.json();
      const { imageData, browser } = data;
      
      if (!imageData) {
        return new Response(JSON.stringify({ error: "No image data provided" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
      const id = `screenshot_${timestamp}_${browser}`;
      
      await env.SCREENSHOTS.put(id, imageData, {
        metadata: {
          timestamp,
          browser,
          type: "image/png"
        }
      });

      return new Response(JSON.stringify({ id, success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Get a specific screenshot
    if (path.startsWith("/api/screenshots/") && request.method === "GET") {
      const id = path.split("/").pop();
      const imageData = await env.SCREENSHOTS.get(id);
      
      if (!imageData) {
        return new Response("Screenshot not found", { status: 404 });
      }

      return new Response(imageData, {
        headers: {
          "Content-Type": "image/png",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // Delete a screenshot
    if (path.startsWith("/api/screenshots/") && request.method === "DELETE") {
      const id = path.split("/").pop();
      await env.SCREENSHOTS.delete(id);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
