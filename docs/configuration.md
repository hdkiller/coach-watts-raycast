# Configuration & Authentication Guide

The Coach Watts Raycast Extension supports flexible authentication options:

1. **OAuth 2.0 PKCE (Recommended)**: Secure sign-in without sharing long-lived keys.
2. **API Key Authentication**: Simple token authentication for scripts or self-hosted setups.
3. **Self-Hosted Instance Support**: Connect to any custom Coach Watts deployment.

---

## 1. Using OAuth 2.0 with PKCE

By default, the extension connects to `https://coachwatts.com` and utilizes the first-party trusted OAuth 2.0 application (`coach-watts-raycast`).

### How OAuth Works in Raycast
1. Upon running any command for the first time without an API key configured, Raycast opens `https://coachwatts.com/oauth/authorize`.
2. After logging in, Coach Watts redirects back to Raycast (`https://raycast.com/redirect?packageName=coach-watts`).
3. Raycast exchanges the authorization code for an OAuth access token and refresh token via PKCE (`/api/oauth/token`).
4. Tokens are stored securely in the macOS Keychain by Raycast and automatically refreshed upon expiration.

---

## 2. API Key Authentication

If you prefer using an API key generated from your Coach Watts Settings page:

1. Log in to Coach Watts (`https://coachwatts.com` or your self-hosted instance).
2. Navigate to **Settings** > **API Keys** and generate a new key.
3. In Raycast, highlight any Coach Watts command and press `Cmd + ,` to open Extension Preferences.
4. Paste your API key into the **API Key (Optional)** field.

*Note: When an API Key is set, the extension prioritizes the API Key over OAuth.*

---

## 3. Self-Hosted Instances

To connect the extension to a self-hosted instance of Coach Watts:

1. In Raycast, open Extension Preferences (`Cmd + ,`).
2. Update **Server Base URL** to your server URL (e.g. `https://watts.my-server.com` or `http://localhost:3000`).
3. Enter your API Key or authorize via OAuth on your self-hosted domain.
