export default function handler(req, res) {
  res.status(200).json({
    success: true,
    updated: new Date().toISOString(),
    items: [
      {
        name: "Huge Happy Rock",
        rap: 120000000,
        previous: 100000000,
        type: "Huge",
        image: "https://placehold.co/300x300?text=Huge+Happy+Rock"
      },
      {
        name: "Huge Cat",
        rap: 890000000,
        previous: 850000000,
        type: "Huge",
        image: "https://placehold.co/300x300?text=Huge+Cat"
      }
    ]
  });
}