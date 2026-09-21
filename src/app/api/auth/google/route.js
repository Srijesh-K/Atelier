import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/google/callback`;

  if (!clientId) {
    // If no Google Client ID is configured, redirect to the signin page with the sandbox modal trigger
    return NextResponse.redirect(`${appUrl}/auth/signin?oauth_sandbox=google&returnTo=${encodeURIComponent(returnTo)}`);
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
