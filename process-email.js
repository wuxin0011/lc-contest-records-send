const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, body, from } = req.body;

    // 调用主要的处理函数
    const result = await axios.post(`${process.env.VERCEL_URL}/handle-email`, {
      emailContent: `${subject} ${body}`,
      sender: from,
      command: extractCommand(`${subject} ${body}`)
    });

    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
};

function extractCommand(text) {
  const match = text.match(/@lc\s+(-?\d+)\s+(-?\d+)/);
  return match ? match[0] : null;
}