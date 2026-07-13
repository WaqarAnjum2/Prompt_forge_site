interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string | null;
  html_url: string;
}

interface UploadResult {
  url: string;
  path: string;
  sha: string;
}

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const REPO = import.meta.env.VITE_GITHUB_REPO || '';
const API = 'https://api.github.com';

class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

function checkConfig(): void {
  if (!TOKEN || !REPO) {
    throw new GitHubError('GitHub token or repo not configured. Set VITE_GITHUB_TOKEN and VITE_GITHUB_REPO in .env', 0);
  }
}

async function request(method: string, path: string, body?: unknown): Promise<Response> {
  checkConfig();
  const res = await fetch(`${API}/repos/${REPO}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new GitHubError(err.message || 'GitHub API error', res.status);
  }
  return res;
}

export async function uploadFile(
  file: File,
  folder: string = 'assets/prompts'
): Promise<UploadResult> {
  const ext = file.name.split('.').pop() || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const filename = `${timestamp}-${random}.${ext}`;
  const path = `${folder}/${filename}`;

  const base64 = await fileToBase64(file);
  const content = base64.split(',')[1];

  const res = await request('PUT', `/contents/${path}`, {
    message: `Upload ${filename}`,
    content,
  });

  const data = await res.json();
  return {
    url: data.content.download_url,
    path: data.content.path,
    sha: data.content.sha,
  };
}

export async function deleteFile(path: string, sha: string): Promise<void> {
  await request('DELETE', `/contents/${path}`, {
    message: `Delete ${path}`,
    sha,
  });
}

export async function listFiles(folder: string = 'assets/prompts'): Promise<GitHubFile[]> {
  const res = await request('GET', `/contents/${folder}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((f: GitHubFile) => ({
    name: f.name,
    path: f.path,
    sha: f.sha,
    size: f.size,
    download_url: f.download_url,
    html_url: f.html_url,
  }));
}

export async function getFile(path: string): Promise<GitHubFile> {
  const res = await request('GET', `/contents/${path}`);
  return res.json();
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { GitHubError };
