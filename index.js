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
  
  const is_stop = false
  
  
  function get_username(username) {
    return username in userRealNameMap ? userRealNameMap[username] : username;
  }
  
  
  async function sleep(time) {
    return new Promise((resolove) => setTimeout(resolove, time));
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
  
  
  let isWeek = true;
  let contestNo = 454;
  
  (async function () {
    let index = 0
    let pageNum = 1
    let pageSize = 10
    // 最近周赛 如果是-1 表示最近一次周赛  -2 表示倒数第二场周赛
    if(process.argv.length == 3 && Number(process.argv[2])<0) {
       let x = Number(process.argv[2])
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
    if(process.argv.length != 4) {
        contestNo = contests[index]['title'].match(/\d+/)[0]
        isWeek = contests[index]['title'].indexOf('双') == -1
    }else{
      isWeek = (process.argv[2] == "1" ||  process.argv[2] == 'True' ||  process.argv[2] == 'true' || process.argv[2] == 'yes')
      contestNo = Number(process.argv[3]) > maxId ? Number(process.argv[3]) : maxId
    }
    console.log("\x1b[36m\x1b[1m\x1b[4m%s\x1b[0m", `\n第 ${contestNo} 场${isWeek ? '':"双"}周赛信息如下🏆\n`);
  })();
  
  
  
  (async function () {
    if(is_stop)return
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
    const list = [];
    const user_pages = [];
    const user_map = new Set();
    let index = 1;
    for (const data of datas) {
      for (const user of data.total_rank) {
        if (queryUserNames.has(user.user_slug)) {
          list.push(summary(user));
          if (!user_map.has(user.user_slug)) {
            user_pages.push({
              username: get_username(user.user_slug),
              rank: user.rank + 1,
              url: `https://leetcode.cn/contest/${getType}-contest-${contestNo}/ranking/${index}/?region=local_v2`,
            });
            user_map.add(user.user_slug);
          }
        }
      }
      index++;
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
  
    function summary(user) {
      // console.log(user)
      const info = {
        id: get_username(user.user_slug),
        rank: user.rank + 1,
        score: user.score,
        time: cost(user.finish_time - startTime),
      };
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
  })();
  
  (async function () {
    // 周赛
    if(is_stop)return
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
  
    let infos = [];
    const inf = 0x3fffffff;
  
    for (let user of queryUserNames) {
      await sleep(50);
      let res = await query(user, queryWeekID);
      let username = get_username(user)
      let empty = {
        用户名: username,
        rank: inf,
        score: 0,
        old_rating: 0,
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
        旧分数: Math.ceil(res["old_rating"]) ?? 0,
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
  })();
  