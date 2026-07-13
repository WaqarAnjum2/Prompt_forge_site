const API = '/api/github';

interface UploadResult {
  url: string;
  path: string;
  sha: string;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string | null;
}

class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

export async function uploadFile(file: File, folder: string = 'assets/prompts'): Promise<UploadResult> {
  const base64 = await fileToBase64(file);
  const content = base64.split(',')[1];

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upload', file: content, filename: file.name, folder }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new GitHubError(err.error || 'Upload failed', res.status);
  }

  return res.json();
}

export async function deleteFile(path: string, sha: string): Promise<void> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', path, sha }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new GitHubError(err.error || 'Delete failed', res.status);
  }
}

export async function listFiles(folder: string = 'assets/prompts'): Promise<GitHubFile[]> {
  const res = await fetch(`${API}?action=list&folder=${encodeURIComponent(folder)}`);
  if (!res.ok) throw new GitHubError('Failed to list files', res.status);
  const data = await res.json();
  return data.files ?? [];
}

export async function getFile(path: string): Promise<GitHubFile> {
  const res = await fetch(`${API}?action=get&path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new GitHubError('Failed to get file', res.status);
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
