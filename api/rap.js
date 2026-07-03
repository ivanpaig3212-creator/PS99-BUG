export default async function handler(req, res) {
  try {
    const response = await fetch("https://ps99rap.com/api/items");

    if (!response.ok) {
      throw new Error("Failed to fetch PS99RAP");
    }

    const data = await response.json();

    const items = Object.values(data);

    res.status(200).json({
      success: true,
      updated: new Date().toISOString(),
      items
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}