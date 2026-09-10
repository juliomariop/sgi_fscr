// Microsoft OneDrive & Microsoft Graph API Service for SGI HSEQ
// Uses Authorization Code Flow (delegated permissions) suitable for SPAs

const STORAGE_KEYS = {
  SETTINGS: 'sgi_onedrive_settings',
  TOKEN_DATA: 'sgi_onedrive_tokens'
};

export const getOneDriveSettings = () => {
  const defaults = {
    enabled: false,
    isDemoMode: true,
    clientId: '',
    tenantId: 'common',
    folderName: 'SGI_Enterprise',
  };
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch (err) {
    console.error("Error reading OneDrive settings:", err);
    return defaults;
  }
};

export const saveOneDriveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving OneDrive settings:", err);
  }
};

export const getStoredTokens = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TOKEN_DATA);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveStoredTokens = (tokens) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN_DATA, JSON.stringify(tokens));
  } catch (e) {
    console.error("Error saving tokens:", e);
  }
};

export const clearStoredTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN_DATA);
};

// Generates the OAuth 2.0 Authorization URL
export const getAuthUrl = (clientId, tenantId) => {
  const tenant = tenantId?.trim() || 'common';
  const redirectUri = window.location.origin;
  const scopes = 'Files.ReadWrite offline_access user.read';
  
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?` +
    `client_id=${encodeURIComponent(clientId?.trim())}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=sgi_onedrive_auth`;
};

// Exchanges Authorization Code for Access & Refresh Tokens
export const exchangeCodeForToken = async (clientId, tenantId, code) => {
  const tenant = tenantId?.trim() || 'common';
  const redirectUri = window.location.origin;
  
  const bodyParams = new URLSearchParams({
    client_id: clientId.trim(),
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    scope: 'Files.ReadWrite offline_access user.read'
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyParams.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token exchange failed: ${response.statusText}. Details: ${errText}`);
  }

  const data = await response.json();
  const tokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
    accountName: 'Cuenta HSEQ Corporativa'
  };

  // Attempt to fetch profile info to get account name
  try {
    const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      tokenData.accountName = meData.userPrincipalName || meData.displayName || tokenData.accountName;
    }
  } catch (err) {
    console.warn("Could not fetch user profile details:", err);
  }

  saveStoredTokens(tokenData);
  return tokenData;
};

// Refreshes the Access Token using the Refresh Token
export const refreshAccessToken = async (clientId, tenantId, refreshToken) => {
  const tenant = tenantId?.trim() || 'common';
  const bodyParams = new URLSearchParams({
    client_id: clientId.trim(),
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyParams.toString()
  });

  if (!response.ok) {
    clearStoredTokens();
    throw new Error(`Refresh token failed: ${response.statusText}`);
  }

  const data = await response.json();
  const existing = getStoredTokens() || {};
  const updated = {
    ...existing,
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // fallback to old refresh token if not returned
    expiresAt: Date.now() + (data.expires_in * 1000)
  };

  saveStoredTokens(updated);
  return updated.accessToken;
};

// Returns a valid access token, auto-refreshing if expired
export const getValidToken = async () => {
  const settings = getOneDriveSettings();
  if (!settings.enabled || settings.isDemoMode) return null;

  const tokens = getStoredTokens();
  if (!tokens || !tokens.refreshToken) {
    throw new Error("No hay credenciales activas. Conecte su cuenta de OneDrive.");
  }

  // If token has expired or expires in the next 2 minutes, refresh it
  if (!tokens.accessToken || tokens.expiresAt - Date.now() < 120000) {
    console.log("Token expired or close to expiry, refreshing...");
    return await refreshAccessToken(settings.clientId, settings.tenantId, tokens.refreshToken);
  }

  return tokens.accessToken;
};

// Upload file binary directly to MS Graph API / OneDrive
export const uploadToOneDriveReal = async (file, folderName, onProgress) => {
  const token = await getValidToken();
  if (!token) throw new Error("No authenticated token found");

  const cleanFolderName = folderName.replace(/^\/+|\/+$/g, '') || 'SGI_Enterprise';
  
  // Microsoft Graph PUT endpoint for files up to 4MB
  // If files are larger, MS Graph recommends upload sessions, but for general docs <4MB PUT is direct and highly reliable
  const endpoint = `https://graph.microsoft.com/v1.0/me/drive/root:/${cleanFolderName}/${encodeURIComponent(file.name)}:/content`;

  // Since standard fetch does not have progress event on uploads, we simulate it up to 90% and snap to 100% on completion
  // This maintains progress bar responsiveness
  let progress = 10;
  onProgress(progress);
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress > 90) progress = 90;
      onProgress(progress);
    }
  }, 150);

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OneDrive upload failed: ${response.statusText}. Details: ${errText}`);
    }

    onProgress(100);
    const data = await response.json();
    
    return {
      success: true,
      webUrl: data.webUrl,
      id: data.id,
      name: data.name,
      size: data.size
    };
  } catch (err) {
    clearInterval(progressInterval);
    throw err;
  }
};

// Mock Upload for Demo Mode
export const uploadToOneDriveMock = async (file, folderName, onProgress) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Generate a convincing OneDrive webUrl link
        const randomId = Math.random().toString(36).substring(2, 17).toUpperCase();
        const mockUrl = `https://fscr-my.sharepoint.com/:b:/g/personal/admin_fscr_co/E${randomId}?e=HseqEnterprise`;
        
        resolve({
          success: true,
          webUrl: mockUrl,
          id: `mock-drive-id-${randomId}`,
          name: file.name,
          size: file.size
        });
      }
    }, 200);
  });
};

export const uploadFile = async (file, folderName, onProgress) => {
  const settings = getOneDriveSettings();
  if (settings.isDemoMode) {
    return await uploadToOneDriveMock(file, folderName, onProgress);
  } else {
    return await uploadToOneDriveReal(file, folderName, onProgress);
  }
};
