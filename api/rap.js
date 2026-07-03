export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(200).json({
        success: true,
        version: "0.2",
        updated: new Date().toISOString(),
        message: "PS99 BUG API is running!",
        items: [
            {
                name: "Huge Happy Rock",
                rap: 120000000
            },
            {
                name: "Huge Cat",
                rap: 890000000
            }
        ]
    });

}