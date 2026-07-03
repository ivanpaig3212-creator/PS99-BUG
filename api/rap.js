export default async function handler(req, res) {
  try {
    const response = await fetch("https://ps99rap.com/api/items", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    res.status(200).json({
      ok: response.ok,
      status: response.status,
      body: text.substring(0, 1000)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
}