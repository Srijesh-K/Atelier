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
    // ignore
  }

  if (errorParam || !code) {
    const errorMsg = errorParam === 'access_denied'
      ? 'GitHub authorization was cancelled.'
      : 'GitHub authentication failed. Please try again.';
    return NextResponse.redirect(`${appUrl}/auth/signin?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange authorization token with GitHub.');
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Atelier-Educational-Platform',
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok || !userData.id) {
      throw new Error('Unable to retrieve user information from GitHub.');
    }

    let userEmail = userData.email;

    // If email is private, fetch user's emails list
    if (!userEmail) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Atelier-Educational-Platform',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) || emails[0];
        if (primaryEmail) {
          userEmail = primaryEmail.email;
        }
      }
    }

    if (!userEmail) {
      userEmail = `${userData.login}@users.noreply.github.com`;
    }

    // Authenticate or register student via OAuth
    const student = await authenticateOAuthStudent({
      name: userData.name || userData.login || 'GitHub User',
      email: userEmail,
      avatar: userData.avatar_url || null,
      provider: 'github',
    });

    // Render client sync bridge
    const profileJson = JSON.stringify(student).replace(/</g, '\\u003c');
    const studentEmail = student.email.replace(/'/g, "\\'");
    const safeTarget = returnTo.startsWith('/') ? returnTo : '/dashboard';

    const bridgeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating with GitHub...</title>
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
  <p>Connecting your GitHub account...</p>
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
    console.error('GitHub OAuth callback error:', err.message);
    return NextResponse.redirect(`${appUrl}/auth/signin?error=${encodeURIComponent(err.message || 'GitHub authentication failed.')}`);
  }
}
