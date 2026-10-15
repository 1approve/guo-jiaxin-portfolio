const GATEWAY = '/.netlify/git/github';
const BRANCH = 'main';

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');

const bytesToBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return window.btoa(binary);
};

const base64ToText = (value) => {
  const binary = window.atob(value.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const textToBase64 = (value) => bytesToBase64(new TextEncoder().encode(value));

const tokenFor = async (user) => {
  if (!user) throw new Error('登录已失效，请重新登录。');
  return user.jwt();
};

const request = async (user, path, options = {}) => {
  const token = await tokenFor(user);
  const response = await fetch(`${GATEWAY}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Git Gateway 请求失败（${response.status}）${detail ? `：${detail.slice(0, 180)}` : ''}`);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const loadRemoteProjects = async (user) => {
  const items = await request(user, `/contents/src/content/projects?ref=${BRANCH}`);
  const jsonFiles = items.filter((item) => item.type === 'file' && item.name.endsWith('.json'));
  const records = await Promise.all(jsonFiles.map(async (item) => {
    const file = await request(user, `/contents/${encodePath(item.path)}?ref=${BRANCH}`);
    return {
      path: item.path,
      sha: file.sha,
      data: JSON.parse(base64ToText(file.content)),
    };
  }));
  return records.sort((a, b) => Number(a.data.order || 0) - Number(b.data.order || 0));
};

export const saveProjectFile = async (user, record, message) => {
  const payload = {
    message,
    content: textToBase64(`${JSON.stringify(record.data, null, 2)}\n`),
    branch: BRANCH,
  };
  if (record.sha) payload.sha = record.sha;
  const result = await request(user, `/contents/${encodePath(record.path)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return { ...record, sha: result.content?.sha || result.sha || record.sha };
};

export const deleteProjectFile = async (user, record) => {
  if (!record.sha) return;
  await request(user, `/contents/${encodePath(record.path)}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message: `删除作品：${record.data.title || record.data.id}`,
      sha: record.sha,
      branch: BRANCH,
    }),
  });
};

const safeName = (name) => {
  const extension = name.includes('.') ? `.${name.split('.').pop().toLowerCase()}` : '';
  const stem = name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'asset';
  return `${Date.now()}-${stem}${extension}`;
};

export const uploadAssetFile = async (user, file, projectId, destination = 'portfolio') => {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('单个文件暂限 25 MB。较大的正片请先压缩，或继续使用现有文件路径。');
  }
  const folder = destination === 'documents'
    ? 'public/assets/documents'
    : `public/assets/portfolio/uploads/${projectId || 'unassigned'}`;
  const filename = safeName(file.name);
  const path = `${folder}/${filename}`;
  const content = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
  await request(user, `/contents/${encodePath(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `上传素材：${filename}`,
      content,
      branch: BRANCH,
    }),
  });
  return destination === 'documents' ? filename : `uploads/${projectId || 'unassigned'}/${filename}`;
};

export const getIdentity = () => window.netlifyIdentity;
