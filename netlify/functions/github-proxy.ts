const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = process.env.GITHUB_REPO || '';
const API = 'https://api.github.com';

async function ghRequest(method: string, path: string, body?: unknown): Promise<Response> {
  if (!GITHUB_TOKEN || !REPO) {
    throw new Error('GitHub not configured on server');
  }
  const res = await fetch(`${API}/repos/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'GitHub API error');
  }
  return res;
}

export const handler = async (event: { httpMethod: string; queryStringParameters: Record<string, string> | null; body: string | null }): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const action = event.queryStringParameters?.action || '';
    const body = event.body ? JSON.parse(event.body) : {};

    if (event.httpMethod === 'POST' && body.action === 'upload') {
      const ext = (body.filename || 'file.png').split('.').pop() || 'png';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${random}.${ext}`;
      const folder = body.folder || 'assets/prompts';
      const path = `${folder}/${filename}`;

      const res = await ghRequest('PUT', `/contents/${path}`, {
        message: `Upload ${filename}`,
        content: body.file,
      });
      const data = await res.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url: data.content.download_url,
          path: data.content.path,
          sha: data.content.sha,
        }),
      };
    }

    if (event.httpMethod === 'POST' && body.action === 'delete') {
      await ghRequest('DELETE', `/contents/${body.path}`, {
        message: `Delete ${body.path}`,
        sha: body.sha,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === 'GET' && action === 'list') {
      const folder = event.queryStringParameters?.folder || 'assets/prompts';
      const res = await ghRequest('GET', `/contents/${folder}`);
      const data = await res.json();
      const files = Array.isArray(data)
        ? data.map((f: { name: string; path: string; sha: string; size: number; download_url: string | null }) => ({
            name: f.name,
            path: f.path,
            sha: f.sha,
            size: f.size,
            download_url: f.download_url,
          }))
        : [];
      return { statusCode: 200, headers, body: JSON.stringify({ files }) };
    }

    if (event.httpMethod === 'GET' && action === 'get') {
      const path = event.queryStringParameters?.path || '';
      const res = await ghRequest('GET', `/contents/${path}`);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }),
    };
  }
};
