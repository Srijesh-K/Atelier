import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const clientId = process.env.GITHUB_CLIENT_ID;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/github/callback`;

  if (!clientId) {
    // If no GitHub Client ID is configured, redirect to the signin page with the sandbox modal trigger
    return NextResponse.redirect(`${appUrl}/auth/signin?oauth_sandbox=github&returnTo=${encodeURIComponent(returnTo)}`);
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', JSON.stringify({ returnTo }));

  return NextResponse.redirect(githubAuthUrl.toString());
}
