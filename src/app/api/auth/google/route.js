import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getGoogleCredentials() {
  let clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    try {
      const keysPath = path.join(process.cwd(), 'google-auth-keys.json');
      if (fs.existsSync(keysPath)) {
        const raw = fs.readFileSync(keysPath, 'utf8');
        const parsed = JSON.parse(raw);
        clientId = parsed.web?.client_id;
      }
    } catch (e) {
      console.error('Failed to read google-auth-keys.json:', e);
    }
  }
  return { clientId };
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const { clientId } = getGoogleCredentials();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=${encodeURIComponent('Google authentication client ID is not configured.')}`);
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');
  googleAuthUrl.searchParams.set('state', JSON.stringify({ returnTo }));

  return NextResponse.redirect(googleAuthUrl.toString());
}
