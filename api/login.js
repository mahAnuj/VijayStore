// Login redirect endpoint for Vercel
export default function handler(req, res) {
  // Redirect to the main app for phone login
  res.writeHead(302, { Location: '/' });
  res.end();
}