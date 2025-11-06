const axios = require('axios');

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emailContent, sender, command } = req.body;

    // 验证必要参数
    if (!emailContent || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 解析邮件内容，查找 @lc -1 1 模式
    const commandMatch = emailContent.match(/@lc\s+(-?\d+)\s+(-?\d+)/);
    
    if (!commandMatch) {
      return res.status(200).json({ 
        success: false, 
        message: 'No valid command found' 
      });
    }

    const [, num1, num2] = commandMatch;
    const extractedCommand = `@lc ${num1} ${num2}`;

    console.log(`Received command: ${extractedCommand} from ${sender}`);

    // 触发 GitHub Actions
    const githubResponse = await triggerGitHubActions(extractedCommand, sender);

    res.status(200).json({
      success: true,
      message: 'Command processed successfully',
      command: extractedCommand,
      githubStatus: githubResponse.status
    });

  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

async function triggerGitHubActions(command, sender) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  // 验证环境变量
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('Missing GitHub configuration');
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`;

  const payload = {
    event_type: 'email-command',
    client_payload: {
      command: command,
      from: sender,
      timestamp: new Date().toISOString()
    }
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  });

  return response;
}