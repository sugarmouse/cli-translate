import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

// const errorMap = {
//   52000:'请求成功',
//   52001:'请求超时',
//   52002:'系统错误',
//   52003:'',
//   54000:'',
//   54001:'',
//   54003:'',
//   54004:'',
//   54005:'',
//   58000:'',
//   58001:'',
//   58002:'',
//   90107:''
// }


export const translate = (word: string) => {

  const salt = Math.random();
  const sign = md5(appId + word + salt + appSecret);
  let fromTo = {
    from: '',
    to: ''
  };

  if (/[a-zA-Z]/.test(word[0])) {
    fromTo = {
      from: 'en',
      to: 'zh'
    };
  } else {
    fromTo = {
      from: 'zh',
      to: 'en'
    };
  }

  const query = querystring.stringify({
    q: word,
    ...fromTo,
    appid: appId,
    salt: salt,
    sign: sign
  });

  const options = {
    hostname: 'fanyi-api.baidu.com',
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let chunks: Buffer[] = [];
    res.on('data', (chunk) => {
      console.log(typeof chunk);
      chunks.push(chunk);
    });
    res.on('end', () => {
      type BaiduResult = {
        error_code?: string;
        error_msg?: string;
        from: string;
        to: string;
        trans_result: {
          src: string;
          dst: string
        }[]
      }
      const data = Buffer.concat(chunks).toString();
      const dataObj: BaiduResult = JSON.parse(data);
      if (dataObj.error_code) {
        console.log(dataObj.error_msg);
        process.exit(2);
      } else {
        dataObj.trans_result.forEach(result => {
          console.log(`${result.src} --translated--to-->  ${result.dst}`);
        });
        process.exit(0);
      }
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
};