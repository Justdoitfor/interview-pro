const FILENAME = 'interview-pro-backup.json';

export async function pushToGist(token: string, gistId: string, data: any): Promise<string> {
  const content = JSON.stringify(data, null, 2);
  const body = {
    description: 'Interview Pro Database Backup (Auto-generated)',
    public: false,
    files: {
      [FILENAME]: { content }
    }
  };

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${token}`,
    'Content-Type': 'application/json'
  };

  if (gistId) {
    // 更新已有 Gist
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`更新 Gist 失败: ${err}`);
    }
    return gistId;
  } else {
    // 创建新的 Gist
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`创建 Gist 失败: ${err}`);
    }
    const resData = await res.json();
    return resData.id;
  }
}

export async function pullFromGist(token: string, gistId: string): Promise<any> {
  if (!gistId) throw new Error('缺少 Gist ID');

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${token}`
  };
  
  const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`读取 Gist 失败: ${err}`);
  }
  
  const data = await res.json();
  const file = data.files[FILENAME];
  if (!file) throw new Error('未在指定的 Gist 中找到备份文件');
  
  // 如果文件太大，GitHub 会返回 truncated 为 true 并提供 raw_url
  if (file.truncated && file.raw_url) {
    const rawRes = await fetch(file.raw_url);
    const rawText = await rawRes.text();
    return JSON.parse(rawText);
  }

  return JSON.parse(file.content);
}