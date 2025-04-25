export function GET() {
  const html = `
  <html lang="en">
    <head><title>webstatus</title></head>
    <body>Status OK:true<br/></body>
  </html>
  `;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
