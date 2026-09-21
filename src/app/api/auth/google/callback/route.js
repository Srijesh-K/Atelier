import { NextResponse } from 'next/server';
import { authenticateOAuthStudent } from '../../../../actions';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const stateRaw = searchParams.get('state');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000';
  let returnTo = '/dashboard';

  try {
    if (stateRaw) {
      const stateObj = JSON.parse(stateRaw);
      if (stateObj.returnTo) returnTo = stateObj.returnTo;
    }
  } catch (e) {
    // ignore state parse errors
  }

  if (errorParam || !code) {
    const errorMsg = errorParam === 'access_denied' 
      ? 'Google authentication was cancelled.' 
      : 'Google authentication failed. Please try again.';
    return NextResponse.redirect(`${appUrl}/auth/signin?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = `${appUrl}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange authorization token with Google.');
    }

    // Fetch user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userInfoResponse.json();

    if (!userInfoResponse.ok || !userData.email) {
      throw new Error('Unable to retrieve profile from Google.');
    }

    // Authenticate or register student via OAuth
    const student = await authenticateOAuthStudent({
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      avatar: userData.picture || null,
      provider: 'google',
    });

    // Render an HTML bridge page that synchronizes client localStorage and dispatches state events
    const profileJson = JSON.stringify(student).replace(/</g, '\\u003c');
    const studentEmail = student.email.replace(/'/g, "\\'");
    const safeTarget = returnTo.startsWith('/') ? returnTo : '/dashboard';

    const bridgeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating with Google...</title>
  <style>
    body {
      background: #0a0a0a;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(242, 85, 34, 0.2);
      border-top-color: #f25522;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Connecting your Google account...</p>
  <script>
    try {
      localStorage.setItem('loggedInStudentEmail', '${studentEmail}');
      localStorage.setItem('studentProfile', JSON.stringify(${profileJson}));
      window.dispatchEvent(new Event('profileChanged'));
      window.dispatchEvent(new Event('courseChanged'));
    } catch (err) {
      console.error('Storage sync error:', err);
    }
    window.location.replace('${safeTarget}');
  </script>
</body>
</html>`;

    return new Response(bridgeHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('Google OAuth callback error:', err.message);
    return NextResponse.redirect(`${appUrl}/auth/signin?error=${encodeURIComponent(err.message || 'Google authentication failed.')}`);
  }
}
