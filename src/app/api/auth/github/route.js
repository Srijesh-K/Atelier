import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getGitHubCredentials() {
  let clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    try {
      const keysPath = path.join(process.cwd(), 'github-auth-keys.json');
      if (fs.existsSync(keysPath)) {
        const raw = fs.readFileSync(keysPath, 'utf8');
        const parsed = JSON.parse(raw);
        clientId = parsed.clientID || parsed.client_id;
      }
    } catch (e) {
      console.error('Failed to read github-auth-keys.json:', e);
    }
  }
  return { clientId };
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const { clientId } = getGitHubCredentials();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/github/callback`;

  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=${encodeURIComponent('GitHub authentication client ID is not configured.')}`);
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', JSON.stringify({ returnTo }));

  return NextResponse.redirect(githubAuthUrl.toString());
}
