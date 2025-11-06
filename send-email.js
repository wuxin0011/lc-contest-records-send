// 查询的用户集合
const queryUserNames = new Set([
  "agitated-curranfnd",
  "endlesscheng",
  "holden_sn",
  "sleepy-neumannc4b",
  "li-wei-ming",
  "silly-heisenberg8lk",
  "yiren-0429",
  "zhangshize",
  "nervous-kalamvox",
]);

// 备注
const userRealNameMap = {
  endlesscheng: "灵神",
  "agitated-curranfnd": "nlogn",
  "sleepy-neumannc4b": "A1",
  "yiren-0429": "伊人",
  "silly-heisenberg8lk": "小小",
  "li-wei-ming": "李伟民",
  "zhangshize": "喜乐",
  "holden_sn": "floor",
  "nervous-kalamvox": "小李飞刀",
};



const nodemailer = require('nodemailer');
let user_pages = [],list = [],infos = [];
let isWeek = true;
let contestNo = 454;
let isLast = true
let TITLE = ''
let index = 0
// console.log('process.env.QQ_EMAIL',process.env.QQ_EMAIL != undefined)
// console.log('process.env.QQ_EMAIL_AUTH_CODE',process.env.QQ_EMAIL_AUTH_CODE != undefined)
// console.log(process.env)




const is_stop = false
let TIME = new Date().toLocaleString()


function get_username(username) {
  return username in userRealNameMap ? userRealNameMap[username] : username;
}


async function sleep(time) {
  return new Promise((resolove) => setTimeout(resolove, time));
}




function checkNumber(s) {
  if(isNaN(s) || s == '0') return "-"
  return s
}


async function contestHistory(pageNum = 1,pageSize = 10) {
    let json = {"operationName":"contestHistory","variables":{"pageNum":pageNum,"pageSize":pageSize},"query":"query contestHistory($pageNum: Int!, $pageSize: Int) {\n  contestHistory(pageNum: $pageNum, pageSize: $pageSize) {\n    totalNum\n    contests {\n      containsPremium\n      title\n      cardImg\n      titleSlug\n      description\n      startTime\n      duration\n      originStartTime\n      isVirtual\n      company {\n        watermark\n        __typename\n      }\n      isEeExamContest\n      __typename\n    }\n    __typename\n  }\n}\n"}
    return fetch("https://leetcode.cn/graphql/", {
      method: "POST",
      cors: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    }).then((res) => res.json());
}




let buildInfos = function() {
  let str = ''
  for(let i = 0;i < infos.length;i++) {
        let className = infos[i]['分数差'] == '-' ? "score-neutral" : infos[i]['分数差'] > 0 ?'score-up' :'score-down'
        let rankClassName = i <= 1 ? `rank-${(i+1)}`:''
        // console.log(infos[i])
        str += `
        
        <tr class=${rankClassName}>
            <td>${infos[i]['排名']}</td>
            <td>${infos[i]['用户名']}</td>
            <td>${checkNumber(infos[i]['当前分数'])}</td>
            <td>${checkNumber(infos[i]['旧分数'])}</td>
            <td>${checkNumber(infos[i]['新分数'])}</td>
            <td class=${className}>${checkNumber(infos[i]['分数差'])}</td>
        </tr>
        `
  }
  return str
}



let buildSolutionInfo = function() {
  let str = ''
  for(let i = 0;i < list.length;i++) {
        let user = list[i]
        let rankClassName = i <= 1 ? `rank-${(i+1)}`:''
        let q = ''
        // console.log(user)
        for(let k = 1;k<=4;k++){
          let key_ = `Q${k}`
          let error_key_ = `Q${k}_wa`
          // <td><span class="badge badge-warning">00:15:55 (1)</span></td>
          // <td><span class="badge badge-success">00:00:53</span></td>
          if(user[key_] != '-') {
            if(user[error_key_]!='-'&&user[error_key_]!=0) {
              q += `<td><span class="badge badge-danger">${user[key_]} (${user[error_key_]})</span></td>`
            }else{
              q += `<td><span class="badge badge-success">${user[key_]}</span></td>`
            }
          }else{
            q += `<td><span class="badge badge-success">-</span></td>`
          }
          
        }
        str += `
        <tr class="${rankClassName}">
              <td>${user.id}</td>
              <td>${user.rank}</td>
              <td>${user.score}</td>
              <td>${String(user.time).replace('336','0')}</td>
              ${q}
          </tr>
        `
  }
  return str
}




let buildRankLinkInfo = function() {
  let s = ''
  for(let i = 0;i < user_pages.length;i++) {
      s += `
      <tr>
        <td>${user_pages[i].username}</td>
        <td>${user_pages[i].rank}</td>
        <td><a href="${user_pages[i].url}" target="_blank">查看排名</a></td>
      </tr>
      `
  }
  return s
  
}

let buildInfos_1 = '',buildSolutionInfo_1 = '',buildRankLinkInfo_1 = ''



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


function HTML(){
  TITLE = `第${contestNo}场${isWeek ? '':"双"}周赛`
  return `    <!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${TITLE}报告</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .contest-info {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-left: 4px solid #3498db;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .section {
            padding: 30px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .section-title {
            font-size: 1.5em;
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-title i {
            color: #3498db;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            min-width: 800px;
        }
        
        th {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 500;
            position: sticky;
            top: 0;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tr:hover {
            background: #e3f2fd;
            transform: translateY(-1px);
            transition: all 0.3s ease;
        }
        
        .rank-1 { background: linear-gradient(135deg, #FFD700 0%, #FFF8DC 100%) !important; }
        .rank-2 { background: linear-gradient(135deg, #C0C0C0 0%, #F5F5F5 100%) !important; }
        .rank-3 { background: linear-gradient(135deg, #CD7F32 0%, #F0E68C 100%) !important; }
        
        .score-up { color: #27ae60; font-weight: bold; }
        .score-down { color: #e74c3c; font-weight: bold; }
        .score-neutral { color: #7f8c8d; }
        
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .badge-success { background: #d4edda; color: #155724; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-info { background: #d1ecf1; color: #0c5460; }
        
        .performance-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .performance-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .performance-card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }
        
        .user-list {
            list-style: none;
        }
        
        .user-list li {
            padding: 10px;
            border-bottom: 1px solid #ecf0f1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-list li:last-child {
            border-bottom: none;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        
        .timestamp {
            color: #bdc3c7;
            margin-top: 10px;
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .stats-grid { grid-template-columns: 1fr; }
            .section { padding: 20px; }
            .performance-summary { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 ${TITLE}报告</h1>
        </div>

        
        <div class="section">
            <div class="section-title">📊 分数预测情况</div>
                <table id="ratingTable">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>用户名</th>
                            <th>当前分数</th>
                            <th>旧分数</th>
                            <th>新分数</th>
                            <th>分数变化</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildInfos_1}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">⏱️ 题目通过情况</div>
            <div class="table-container">
                <table id="questionTable">
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>排名</th>
                            <th>总分</th>
                            <th>用时</th>
                            <th>Q1</th>
                            <th>Q2</th>
                            <th>Q3</th>
                            <th>Q4</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildSolutionInfo_1}
                    </tbody>
                </table>
            </div>
        </div>

        
        <div class="section">
            <div class="section-title">🔗 排名详情链接</div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>排名</th>
                            <th>详情链接</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildRankLinkInfo_1}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>此报告由LeetCode监控系统自动生成 • 数据更新时间: <span id="currentTime">${TIME}</span></p>
            <p class="timestamp">${TITLE} • LeetCode竞赛数据</p>
        </div>
    </div>

    <script>
        // 更新时间
        document.getElementById('currentTime').textContent = new Date().toLocaleString('zh-CN');
        
        // 添加表格行悬停效果
        document.addEventListener('DOMContentLoaded', function() {
            const rows = document.querySelectorAll('tr');
            rows.forEach(row => {
                row.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                row.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        });
    </script>
</body>
</html>`
}


async function sendEmail() {
  if(!(process.env.QQ_EMAIL != undefined && process.env.QQ_EMAIL_AUTH_CODE != undefined)){
    console.error("获取不到邮箱和验证码")
    process.exit(-1)
    return;
  }
  await sleep(10000)
  buildSolutionInfo_1 = buildSolutionInfo()
  buildInfos_1 = buildInfos()
  buildRankLinkInfo_1 = buildRankLinkInfo()
    // 邮件内容
  const mailOptions = {
    from: `2191377759@qq.com`,
    subject: `LeetCode ${TITLE} 报告`,
    text: '',
    html: HTML()
  };
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
        await sleep(1000)
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



(async function () {
  
  let pageNum = 1
  let pageSize = 10
  // 最近周赛 如果是-1 表示最近一次周赛  -2 表示倒数第二场周赛
  if(isLast) {
     let x = -1
     index = -(x + 1)
     pageNum = Math.floor(index / pageSize) + pageNum;
     index %= pageSize
  }
  // console.log("pagenum = ",pageNum,"pagesize = ",pageSize)
  let res = await contestHistory(pageNum,pageSize)
  let contests = res.data.contestHistory['contests']
  // for(let info of contests) {
  //   console.log(info.title)
  // }
  if(index<0||index>=contests.length)index = 0;
  let maxId = contests[0]['title'].match(/\d+/)[0]
  contestNo = contests[index]['title'].match(/\d+/)[0]
  isWeek = contests[index]['title'].indexOf('双') == -1
  console.log("\x1b[36m\x1b[1m\x1b[4m%s\x1b[0m", `\n第 ${contestNo} 场${isWeek ? '':"双"}周赛信息如下🏆\n`);
  await sleep(1000)
  const getType = (isWeek ? "" : "bi") + "weekly";
  const response = await fetch(
    `https://leetcode.cn/contest/api/info/${getType}-contest-${contestNo}/`,
    {
      method: "GET",
      // headers: {
      //   'Cookie': cookie,
      //   'User-Agent': 'Mozilla/5.0',
      // }
    }
  );

  const data = await response.json();
  // console.log(data)
  const startTime = data.contest.start_time;
  const n = data.user_num;
  const qs = data.questions.map((q) => q.question_id);

  // 总页数(每页25条)
  const pages = (n - 1) / 25 + 1;
  const responsePromises = [];

  for (let i = 1; i <= pages; i++) {
    responsePromises.push(
      fetch(
        `https://leetcode.cn/contest/api/ranking/${getType}-contest-${contestNo}/?pagination=${i}&region=local_v2`
      )
    );
  }
  const responses = await Promise.all(responsePromises);
  const datas = await Promise.all(responses.map((response) => response.json()));

  
  const user_map = new Set();
  let curIndex = 1;
  for (const data of datas) {
    for (const user of data.total_rank) {
      if (queryUserNames.has(user.user_slug)) {
        let temp_info = await summary(user)
        // console.log(temp_info)
        list.push(temp_info);
        if (!user_map.has(user.user_slug)) {
          user_pages.push({
            username: get_username(user.user_slug),
            rank: user.rank + 1,
            url: `https://leetcode.cn/contest/${getType}-contest-${contestNo}/ranking/${curIndex}/?region=local_v2`,
          });
          user_map.add(user.user_slug);
        }
      }
    }
    curIndex++;
  }

  function cost(time) {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return (
      (h < 10 ? "0" : "") +
      h +
      ":" +
      ((m < 10 ? "0" : "") + m) +
      ":" +
      ((s < 10 ? "0" : "") + s)
    );
  }

  async function summary(user) {
    // console.log(user)
    const info = {
      id: get_username(user.user_slug),
      rank: user.rank + 1,
      score: user.score,
      time: String(cost(user.finish_time - startTime)).replace('336','0'),
    };
    await sleep(500)
    qs.forEach((qid, i) => {
      info[`Q${i + 1}`] = user.submissions[qid]
        ? cost(user.submissions[qid].date - startTime)
        : "-";
      info[`Q${i + 1}_wa`] = user.submissions[qid]
        ? user.submissions[qid].fail_count
        : "-";
    });
    return info;
  }

  console.log("\x1b[36m\x1b[1m\x1b[4m%s\x1b[0m", "题目通过情况");
  console.table(list);
  console.log("\x1b[36m\x1b[1m\x1b[4m%s\x1b[0m", "排名页详细");
  console.table(user_pages);
  // 周赛
  await sleep(1000)
  let queryWeekID = (isWeek ? "" : "bi") + `weekly-contest-${contestNo}`;
  async function queryRating(username) {
    let json = {
      query:
        "\n    query userContestRankingInfo($userSlug: String!) {\n  userContestRanking(userSlug: $userSlug) {\n    attendedContestsCount\n    rating\n    globalRanking\n    localRanking\n    globalTotalParticipants\n    localTotalParticipants\n    topPercentage\n  }\n  userContestRankingHistory(userSlug: $userSlug) {\n    attended\n    totalProblems\n    trendingDirection\n    finishTimeInSeconds\n    rating\n    score\n    ranking\n    contest {\n      title\n      titleCn\n      startTime\n    }\n  }\n}\n    ",
      variables: {
        userSlug: username,
      },
      operationName: "userContestRankingInfo",
    };
    return fetch("https://leetcode.cn/graphql/noj-go/", {
      method: "POST",
      cors: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    }).then((res) => res.json());
  }

  async function query(username, weekId) {
    let url = `https://lccn.lbao.site/api/v1/contest-records/user?contest_name=${weekId}&username=${username}&archived=false`;
    return fetch(url, {
      method: "GET",
      cors: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }

 

  // console.log(
  //   "\x1b[36m\x1b[1m\x1b[4m%s\x1b[0m",
  //   `start query : ${queryWeekID}`
  // );

  
  const inf = 0x3fffffff;

  for (let user of queryUserNames) {
    await sleep(50);
    let res = await query(user, queryWeekID);
    let username = get_username(user)
    let empty = {
      用户名: username,
      rank: inf,
      new_rating: 0,
      delta_rating: 0,
    };
    try {
      res = (Array.isArray(res) && res.length > 0 ? res[0] : empty) ?? empty;
    } catch (e) {
      // console.error(e)
      res = empty;
    }

    let info = {
      用户名: username,
      排名: res["rank"] ?? 1000000,
      分数: Math.ceil(res["score"]) ?? 0,
      旧分数: isNaN(Math.ceil(res["old_rating"])) ? '-':Math.ceil(res["old_rating"]) ?? 0,
      新分数: Math.ceil(res["new_rating"]) ?? 0,
      分数差: Math.ceil(res["delta_rating"]) ?? 0,
    };

    await sleep(20);
    let record = await queryRating(user);
    let userContestRanking = Math.ceil(
      record.data.userContestRanking["rating"]
    );
    let userContestRankingHistory = record.data.userContestRankingHistory;
    if (info["旧分数"] <= 10 || info["旧分数"] == "-") {
      info["旧分数"] = "-";
      info["新分数"] = "-";
      info["分数差"] = "-";
    }
    info["当前分数"] = userContestRanking;

    infos.push(info);
  }
  infos.sort((x, y) =>
    x["排名"] == y["排名"]
      ? y["当前分数"] - x["当前分数"]
      : x["排名"] - y["排名"]
  );

  for (let i = 0; i < infos.length; i++) {
    if (infos[i]["排名"] == inf) {
      infos[i]["排名"] = "-";
    }
  }
  console.log("\x1b[36m\x1b[1m\x1b[4m%s\x1b[0m", "分数预测情况");

  // console.log('\n分数预测情况\n')


  console.table(infos, [
    "排名",
    "用户名",
    "排名",
    "当前分数",
    "旧分数",
    "新分数",
    "分数差",
  ]);

  sendEmail()
})();


