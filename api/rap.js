export default async function handler(req, res) {
  try {
    const response = await fetch("https://ps99rap.com/api/items");

    if (!response.ok) {
      throw new Error("Failed to fetch PS99RAP API");
    }

    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}