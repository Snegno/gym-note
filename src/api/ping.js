export default async function handler(req, res) {
  try {
    const response = await fetch('https://gym-note.onrender.com/api/ping');
    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
