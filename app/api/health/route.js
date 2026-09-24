export async function GET() {
  return Response.json({
    status: 'ok',
    framework: 'next.js',
    timestamp: new Date().toISOString(),
  });
}
