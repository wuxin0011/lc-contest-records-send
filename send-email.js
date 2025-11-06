// send-email.js
import nodemailer from 'nodemailer';

// 配置收件人列表
const recipientList = [
  '1019395329@qq.com',
  // 添加更多收件人...
];

// QQ邮箱配置
const emailConfig = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true, // 使用SSL
  auth: {
    user: process.env.QQ_EMAIL, // 从环境变量读取
    pass: process.env.QQ_EMAIL_AUTH_CODE // 从环境变量读取
  }
};

// 邮件内容
const mailOptions = {
  from: `LeetCode监控系统 <${process.env.QQ_EMAIL}>`,
  subject: 'LeetCode周赛报告',
  text: '这里是周赛报告的文本内容',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f8ff; padding: 15px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .footer { color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏆 LeetCode周赛报告</h1>
      </div>
      <div class="content">
        <p>这是一封自动生成的周赛报告邮件。</p>
        <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <div class="footer">
        <p>此邮件由LeetCode监控系统自动发送</p>
      </div>
    </body>
    </html>
  `
};

async function sendEmail() {
  try {
    // 创建传输器
    const transporter = nodemailer.createTransport(emailConfig);
    
    // 验证连接配置
    await transporter.verify();
    console.log('✅ SMTP连接配置正确');
    
    // 给每个收件人发送邮件
    let successCount = 0;
    let failCount = 0;
    
    for (const recipient of recipientList) {
      try {
        mailOptions.to = recipient;
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ 邮件已发送到: ${recipient}`);
        successCount++;
        
        // 避免发送频率过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ 发送到 ${recipient} 失败:`, error.message);
        failCount++;
      }
    }
    
    console.log(`\n📊 发送统计:`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${failCount}`);
    console.log(`📧 总计: ${recipientList.length}`);
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
    process.exit(1);
  }
}

// 运行发送函数
sendEmail();