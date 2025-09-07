export async function POST() {
  const options = ['session=;', 'HttpOnly', 'Path=/', 'Max-Age=0', 'SameSite=Lax'].join('; ');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Set-Cookie': options, 'Content-Type': 'application/json' },
  });
}