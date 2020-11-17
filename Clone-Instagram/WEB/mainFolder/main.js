  var cors = require('cors');
  const express = require('express');
  const path = require('path');
  const mysql = require('mysql');
  const multer = require('multer')
  const fs = require('fs').promises;
  const fs2 = require('fs');
  const session = require('express-session');
  const FileStore = require('session-file-store')(session);
  let { PythonShell } = require('python-shell');
  let pyData;
  // let pyshell = new PythonShell('./public/py/friend-recommend.py');
  const app = new express();
  let postImageLink;
  let profileImageLink;
  
  app.use(express.static('public'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(session({
    secret: 'akdfhasdjflj!@#!@@@', // 노출되어서 안되는 꼭 넣어야하는 옵션
    resave: false, // false로 두기
    saveUninitialized: true,  // 세션이 필요하기 전까지 구동하지 않는다! (기본적으로 true)
    store: new FileStore(),
  }));
  
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(cors({ origin: true, credentials: true }));
  const db = mysql.createConnection({
    hosts: 'localhost',
    user: 'root',
    password: 'dlwhwnzjqjrm',
    database: 'instagram'
  });
  // DB연결
  db.connect();
  app.use((req, res, next) => {
    db.query(`select * from post order by post_id desc limit 1;`, async (err, data) => {
      if (data.length === 0) {
        req.postImageLink = 1;
        postImageLink = req.postImageLink;
        profileImageLink = req.session.idname;
      } else {
        req.postImageLink = data[0].post_id + 1;
        postImageLink = req.postImageLink;
        profileImageLink = req.session.idname;
      }
      
      next();
    });
  });
  
  app.get('/main_friend', (req, res, next) => {
    let pyOption = {
      mode: 'json',
      pythonPath: '',
      pythonOptions: ['-u'],
      scriptPath: './public/py',
      args: [req.session.idname]
    }
    PythonShell.run('./friend-recommendation.py', pyOption, (err, results) => {
      if (err) {
        console.error(err);
      }
      return res.end(JSON.stringify(results));
    })
  })
  app.post('/android_main', (req, res)=>{
    const data = req.body;
    db.query(`select post.post_id, id, nickname, content, upload_date from post left join post_content on post.post_id = post_content.post_id where id in (select following_id from following where id ="${data.name}");`,async (err, data)=>{
      if(data.length===0){
        return res.end(JSON.stringify(data));
      }
      for(let i=0; i<data.length; i++) {
        // console.log(i);
        const imageLink = await fs.readdir(`./public/data/${data[i].post_id}`);
        index = data[i].post_id;
        data[i].images = imageLink.length;
        console.log(data)
        if(i === data.length-1){
          return res.end(JSON.stringify(data));
        }
      }
    })
  })
  app.post('/android_main2', (req, res)=>{
    const data = req.body;
    db.query(`select post.post_id, id, nickname, content, upload_date from post left join post_content on post.post_id = post_content.post_id where id in (select following_id from following where id ="${data.name}");`,async (err, data)=>{
      if(data.length===0){
        return res.end(JSON.stringify(data));
      }
      for(let i=0; i<data.length; i++) {
        // console.log(i);
        const imageLink = await fs.readdir(`./public/data/${data[i].post_id}`);
        index = data[i].post_id;
        data[i].images = imageLink;
        console.log(data)
        if(i === data.length-1){
          return res.end(JSON.stringify(data));
        }
      }
    })
  })
  app.post('/android_mypage', (req, res)=>{
    const data = req.body;
    db.query(`select post_id from post where id="${data.name}");`,async (err, data)=>{
      if(data.length===0){
        return res.end(JSON.stringify(data));
      }
      return res.end(JSON.stringify(data));
    })
  })
  app.get('/android_login', (req, res) => {
    db.query(`select id, password from user`, (err, data) => {
      return res.end(JSON.stringify(data));
    })
  })
  app.get('/error', async (req, res) => {
    const data = await fs.readFile('./public/html/error.html');
    res.end(data);
  });
  app.get('/', async (req, res) => {
    const data = await fs.readFile('./public/html/login.html');
    req.session.is_logined = false;
    res.end(data);
  });
  app.get('/signup', async (req, res) => {
    const data = await fs.readFile('./public/html/signup.html');
    res.end(data);
  })
  app.get('/main', async (req, res, next) => {
    try {
      if (req.session.idname) {
        const data = await fs.readFile('./public/html/main.html');
        return res.end(data);
      } else {
        res.redirect('/');
      }
    } catch (err) {
      console.error(err);
      res.redirect('/')
    }
  });
  app.get('/main_data', async (req, res) => {
    const user_data = {
      id: req.session.idname,
      name: req.session.realname,
      nick: req.session.nickname,
      images: {},
      post: [],
    };
    let index;
    db.query(`select post.post_id, id, nickname, content, upload_date from post left join post_content on post.post_id = post_content.post_id where id in (select following_id from following where id ="${user_data.id}");`, async (err, data) => {
      if (data.length === 0) {
        user_data.profile = await fs.readdir(`./public/data/${user_data.id}`);
        return res.end(JSON.stringify(user_data));
      }
      for (let i = 0; i < data.length; i++) {
        const imageLink = await fs.readdir(`./public/data/${data[i].post_id}`);
        user_data.profile = await fs.readdir(`./public/data/${user_data.id}`);
        index = data[i].post_id;
        user_data.images[index] = Array.from(imageLink);
        if (i === data.length - 1) {
          user_data.post = data;
          return res.end(JSON.stringify(user_data));
        };
      };
    });
  });
  
  app.get('/comment_data', (req, res) => {
    db.query(`select post_comment.id, post_comment.post_id,post_comment.nickname, post_comment.comment, post_comment.upload_date from post left join post_comment on post.post_id = post_comment.post_id  where post.id in (select following_id from following where id ="${req.session.idname}") and post_comment.post_id in (select post_id from post_comment) order by post_comment.post_id desc, post_comment.upload_date asc;`, (err, data) => {
      if (err) next(new Error('댓글 불러오기 오류'));
      return res.end(JSON.stringify(data));
    })
  })
  // 좋아요 READ 라우터
  app.get('/like_process', (req, res) => {
    db.query(`select * from post_likes where likes_id ='${req.session.idname}' order by post_id desc`, (err1, data1) => {
      if (err1) next(new Error('좋아요 불러오기 실패'));
      db.query(`select * from post_likes order by post_id desc`, (err2, data2) => {
        const data = { data1, data2 };
        if (err2) next(new Error('좋아요 불러오기 실패'));
        return res.end(JSON.stringify(data));
      });
    });
  });
  app.post('/feed_like_process', (req, res, next) => {
    const postID = req.body;
    db.query(`select * from post_likes where likes_id ='${req.session.idname}' and post_id = ${postID.postID} order by post_id desc`, (err1, data1) => {
      if (err1) next(new Error('좋아요 불러오기 실패'));
      db.query(`select * from post_likes where post_id = ${postID.postID} order by post_id desc`, (err2, data2) => {
        const data = { data1, data2 };
        if (err2) next(new Error('좋아요 불러오기 실패'));
        return res.end(JSON.stringify(data));
      });
    });
  });
  app.get('/search_data', async (req, res, next) => {
    const feedPost = {
      id: req.session.idname,
      nickname: req.session.nickname,
      post: {},
      images: {},
    };
    
    if(req.session.searchData.search_text.startsWith('#')){
      db.query(`select post.post_id, post.id, nickname, content,upload_date from post left join post_content on post.post_id = post_content.post_id where content like '%${req.session.searchData.search_text}%';`,async (err, data)=>{
        for(let i=0; i<data.length; i++){
          feedPost.images[i] = await fs.readdir(`./public/data/${data[i].post_id}`);
        }
        feedPost.post = data;
        return res.end(JSON.stringify(feedPost));
      })
    }else {
      db.query(`select user.id, nickname, following_id from user left join following on following.id = '${req.session.idname}' and user.id = following.following_id where not user.id='${req.session.idname}' and (user.id like '%${req.session.searchData.search_text}%' or user.nickname like '%${req.session.searchData.search_text}%')`, (err, data) => {
        if (err) next(new Error('검색오류'));
        return res.end(JSON.stringify(data));
      });
    }
  });
  
  //로그아웃 라우터
  app.get('/logout', async (req, res) => {
    await req.session.destroy((err) => {
      return res.end('logout');
    });
  });
  
  // 로그인라우터
  app.post('/login', async (req, res) => {
    const user = req.body;
    let isLogin = false;
    db.query(`select * from user`, (err, data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === user.id && data[i].password === user.password) {
          isLogin = true;
          req.session.is_logined = true;
          req.session.idname = user.id;
          req.session.nickname = data[i].nickname;
          req.session.realname = data[i].name;
          req.session.save(() => {
          })
        }
      }
      if (!isLogin) {
        return res.end('fail');
      } else {
        return res.end('success');
      }
    });
  });
  // 회원가입 라우터
  app.post('/signup_get_id', (req, res, next)=>{
    db.query('select id, nickname from user', (err, data)=>{
      if(err) next(new Error('회원가입 아이디 중복확인 오류'));
      return res.end(JSON.stringify(data));
    })
  })
  app.post('/signup_process', (req, res, next) => {
    const user = req.body;
    db.query(`insert into user (id, password, nickname, name) values ('${user.id}', '${user.password}', '${user.nickname}', '${user.name}');`, (err1, data1) => {
      if (err1) {
        next(new Error('아이디가 중복됩니다.1'));
      } else {
        
        db.query(`insert into following values ('${user.id}','${user.id}')`, (err2, data2) => {
          if (err2) {
            next(new Error('아이디가 중복됩니다.2'));
          }
          try {
            fs2.mkdirSync(`./public/data/${user.id}`);
            fs.copyFile('./public/images/기본프로필.png', `./public/data/${user.id}/1.jpg`);
            res.redirect('/')
          } catch (err) {
            next(new Error('아이디가 중복됩니다.3'));
          }
        })
      }
    })
  })
  let fileIndex = 1;
  let upload = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        done(null, `./public/data/${postImageLink}`);
      },
      filename(req, file, done) {
        const ext = '.jpg';
        done(null, fileIndex++ + ext);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  // 게시글 업로드 라우터
  app.post('/insert', async (req, res, next) => {
    try {
      fs2.readdirSync(`./public/data/${req.postImageLink}`);
    } catch (error) {
      console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
      fs2.mkdirSync(`./public/data/${req.postImageLink}`);
    }
    console.log('폴더 생성후 파일 저장하러갑니다!')
    next();
  }, upload.array('images'), (req, res) => {
    // console.log(req.files, req.body); 
    fileIndex = 1;
    const body = req.body;
    db.query(`insert into post (post_id, id, nickname) values ('${req.postImageLink}', '${req.session.idname}', '${req.session.nickname}')`, (err, data1) => {
      db.query(`select * from post order by post_id desc limit 1;`, async (err, data2) => {
        db.query(`insert into post_content (post_id, content) values ('${data2[0].post_id}', '${body.content}')`, (err, data3) => {
          res.redirect('/main');
        })
      })
    });
  });
  let profile_upload = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        done(null, `./public/data/${profileImageLink}`);
      },
      filename(req, file, done) {
        const ext = '.jpg';
        done(null, 1 + ext);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  
  // 프로필 변경라우터
  app.post('/changeProfile', async (req, res, next) => {
    try {
      fs2.readdirSync(`./public/data/${req.session.idname}`);
      
    } catch (error) {
      console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
      fs2.mkdirSync(`./public/data/${req.session.idname}`);
    }
    console.log('폴더 생성후 파일 저장하러갑니다!')
    next();
  }, profile_upload.single('profile'), (req, res) => {
    res.redirect('/main');
  });
  
  // 댓글 업로드 라우터
  app.post('/insert_comment', (req, res) => {
    const comment = req.body;
    db.query(`insert into post_comment (id, nickname, post_id, comment) values ('${req.session.idname}','${req.session.nickname}',${comment.postID},'${comment.comment_content}')`, (err, data) => {
      if (err) next(new Error('댓글 등록 실패'));
      res.redirect('/main');
    })
  })
  app.post('/feed_insert_comment', async (req, res, next)=>{
    const comment = req.body;
    db.query(`insert into post_comment (id, nickname, post_id, comment) values ('${req.session.idname}','${req.session.nickname}',${comment.postID},'${comment.comment_content}')`, (err, data) => {
      if (err) next(new Error('댓글 등록 실패'));
      return res.end();
    })
  })
  app.post('/feed_comment_data', async (req, res, next)=>{
    const post = req.body;
    db.query(`select * from post_comment where post_id = ${post.postID} order by upload_date asc`, (err, data) => {
      if (err) next(new Error('댓글 불러오기 오류'));
      return res.end(JSON.stringify(data));
    })
  })
  // 검색 라우터
  app.post('/search', async (req, res) => {
    const data = req.session.searchData = req.body;
    if(data.search_text.length>1){
      
      if (data.search_text.startsWith('#')) {
        const html = await fs.readFile('./public/html/feedSearch.html');
        res.end(html);
      } else {
        const html = await fs.readFile('./public/html/search.html');
        res.end(html);
      }
    }else {
      res.send(`<script type="text/javascript"> window.location.replace('/main');alert("두글자 이상 검색하세요"); </script>`)
    }
  })
  // 팔로잉 라우터
  app.post('/add_following', (req, res, next) => {
    const user = req.body.followingIndex;
    db.query(`insert into following values ('${req.session.idname}','${user.split('-')[0]}')`, (err, data) => {
      if (err) next(new Error('팔로잉 실패'));
      return res.end();
    })
  })
  app.post('/right_add_following', (req, res) => {
    const user = req.body;
    db.query(`insert into following values ('${req.session.idname}','${user.idData}')`, (err, data) => {
      if (err) next(new Error('팔로잉 실패'));
      return res.end();
    })
  })
  //팔로잉 취소라우터
  app.post('/cancel_following', (req, res, next) => {
    const user = req.body.followingIndex;
    db.query(`delete from following where id='${req.session.idname}' and following_id = '${user.split('-')[0]}'`, (err, data) => {
      if (err) next(new Error('팔로잉 실패'));
      return res.end();
    })
  });
  app.post('/right_cancel_following', (req, res) => {
    const user = req.body;
    db.query(`delete from following where id='${req.session.idname}' and following_id = '${user.idData}'`, (err, data) => {
      if (err) next(new Error('팔로잉 실패'));
      return res.end();
    })
  })
  // 좋아요 추가 라우터
  app.post('/add_like', (req, res) => {
    const like = req.body;
    db.query(`insert into post_likes values (${like.likePostID}, '${req.session.idname}')`, (err, data) => {
      if (err) next(new Error('좋아요 추가에러'))
      return res.end();
    });
  });
  // 좋아요 취소 라우터
  app.post('/cancel_like', (req, res) => {
    const like = req.body;
    db.query(`delete from post_likes where post_id = ${like.likePostID} and likes_id = '${req.session.idname}'`, (err, data) => {
      if (err) next(new Error('좋아요 추가에러'))
      return res.end();
    });
  });
  app.post('/nickData', (req, res) => {
    let name = req.body;
    name = Object.keys(name);
    let result = [];
    db.query(`select id, nickname from user`, (err, data) => {
      for (let j = 0; j < name.length; j++) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].id == name[j]) {
            result.push(data[i].nickname);
          }
        }
      }
      return res.end(JSON.stringify(result));
    })
  })
  app.post('/delete_comment', (req, res) => {
    const comment = req.body;
    db.query(`delete from post_comment where post_id = ${comment.post_id} and nickname = '${comment.nickname}'`, (err, data) => {
      if (err) next(new Error('댓글 삭제 실패'));
      return res.end();
    })
  })
  // app.post('/delete', (req, res) => {
  //   const user = req.body;
  //   req.session.deletePostId = user;
  //   return res.end();
  // });
  // app.post('/delete_process', (req, res, next) => {
  //   db.query(`delete from post where post_id = ${req.session.deletePostId.userPostId[1]}`, async (err1, data1) => {
  //     if (err1) next(new Error('삭제 실패'));
  //     db.query(`delete from post_content where post_id = ${req.session.deletePostId.userPostId[1]}`, async (err2, data2) => {
  //       if (err2) next(new Error('삭제 실패'));
  //       db.query(`delete from post_comment where post_id = ${req.session.deletePostId.userPostId[1]}`, async (err3, data3) => {
  //         if (err3) next(new Error('삭제 실패'));
  //         db.query(`delete from post_likes where post_id = ${req.session.deletePostId.userPostId[1]}`, async (err4, data4) => {
  //           if (err4) next(new Error('삭제 실패'));
  //           const filename = await fs.readdir(`./public/data/${req.session.deletePostId.userPostId[1]}`);
  //           for (let i = 0; i < filename.length; i++) {
  //             await fs.unlink(`./public/data/${req.session.deletePostId.userPostId[1]}/${filename[i]}`);
  //           }
  //           await fs.rmdir(`./public/data/${req.session.deletePostId.userPostId[1]}`)
  //           return res.end(JSON.stringify(req.session.deletePostId.userPostId[1]));
  //         });
  //       });
  //     });
  //   });
  // });
  app.post('/new_delete', (req, res, next)=>{
    const post = req.body;
    db.query(`delete from post where post_id = ${post.id}`, async (err1, data1) => {
      if (err1) next(new Error('삭제 실패'));
      db.query(`delete from post_content where post_id = ${post.id}`, async (err2, data2) => {
        if (err2) next(new Error('삭제 실패'));
        db.query(`delete from post_comment where post_id = ${post.id}`, async (err3, data3) => {
          if (err3) next(new Error('삭제 실패'));
          db.query(`delete from post_likes where post_id = ${post.id}`, async (err4, data4) => {
            if (err4) next(new Error('삭제 실패'));
            const filename = await fs.readdir(`./public/data/${post.id}`);
            for (let i = 0; i < filename.length; i++) {
              await fs.unlink(`./public/data/${post.id}/${filename[i]}`);
            }
            await fs.rmdir(`./public/data/${post.id}`)
            return res.end();
          });
        });
      });
    });
  })
  app.post('/is_user', async (req, res, next)=>{
    const is_user = req.body;
    db.query(`select password from user where id='${req.session.idname}'`, (err, data)=>{
      if(err) next(new Error('패스워드 조회실패'))
      if(is_user.password == data[0].password){
        return res.end(JSON.stringify('true'))
      }else {
        return res.end(JSON.stringify('false'))
      }
    })
  })
  app.post('/delete_user', async (req, res, next)=>{
    db.query(`select post_id from post where id='${req.session.idname}'`, (err0, data0)=>{
      db.query(`delete p from post_content as p left join post on post.post_id = p.post_id where post.id = '${req.session.idname}'`, (err1, data1)=>{
        if(err1) next(new Error('포스트 컨텐트 삭제 실패'))
        db.query(`delete p from post as p left join user on user.id = p.id where user.id='${req.session.idname}'`, (err2, data2)=>{
          if(err2) next(new Error('포스트 삭제 실패'))
          db.query(`delete from post_comment where id = '${req.session.idname}'`, (err3, data3)=>{
            if(err3) next(new Error('포스트 댓글 삭제 실패'))
            db.query(`delete from post_likes where likes_id='${req.session.idname}'`, (err4, data4)=>{
              if(err4) next(new Error('포스트 좋아요 삭제 실패'))
              db.query(`delete from following where id = '${req.session.idname}' or following_id = '${req.session.idname}';`, (err5, data5)=>{
                if(err5) next(new Error('팔로잉 삭제 실패'))
                db.query(`delete from user where id='${req.session.idname}'`,async (err6, data6)=>{
                  if(err6) next(new Error('아이디 삭제 실패'))
                  if(data0.length !==0){
                    for (let i = 0; i < data0.length; i++) {
                      const filename = await fs.readdir(`./public/data/${data0[i].post_id}`);
                      for(let j=0; j<filename.length; j++){
                        await fs.unlink(`./public/data/${data0[i].post_id}/${filename[j]}`);
                      }
                      await fs.rmdir(`./public/data/${data0[i].post_id}`)
                    }
                    await fs.unlink(`./public/data/${req.session.idname}/1.jpg`)
                    await fs.rmdir(`./public/data/${req.session.idname}`)
                    await req.session.destroy((err) => {
                      return res.end();
                    });
                  }else {
                    await fs.unlink(`./public/data/${req.session.idname}/1.jpg`)
                    await fs.rmdir(`./public/data/${req.session.idname}`)
                    await req.session.destroy((err) => {
                      return res.end();
                    });
                  }
                })
              })
            })
          })
        })
      })
    })
  })
  
  // 마이페이지 시작
  app.get('/mypage', async (req, res) => {
    const myPage = await fs.readFile('./public/html/mypage.html');
    return res.end(myPage); 
  });
  
  app.post('/mypage', async (req, res, next)=>{
    const myPage = {
      post: {},
      images: {},
    }
    db.query(`select post.*, content from post left join post_content on post.post_id = post_content.post_id where id = '${req.session.idname}' order by post.post_id desc`, async (err, data)=>{
      if(err) next(new Error('myPage 데이터 불러오기 오류'));
      for(let i=0; i<data.length; i++){
        myPage.images[i] = await fs.readdir(`./public/data/${data[i].post_id}`);
      }
      myPage.post = data;
      res.end(JSON.stringify(myPage));
    })
  });
  
  app.get('/follower_length', async (req, res, next) => {
    db.query(`select following.id, following.following_id, user.nickname from following left join user on following.id = user.id where not following.id='${req.session.idname}' and following.following_id = '${req.session.idname}'`, async (err, data) => {
      if(err) next(new Error('follower 오류'));
      return res.end(JSON.stringify(data));
    })
  });
  
  app.get('/follow_length', async (req, res, next) => {
    db.query(`select following.id, following.following_id, user.nickname from following left join user on following.following_id = user.id where not following.following_id='${req.session.idname}' and following.id = '${req.session.idname}'`, (err, data) => {
      if(err) next(new Error('follower 오류'));
      return res.end(JSON.stringify(data));
    })
  });
  // 마이페이지 끝
  // 피드 추천 시작
  app.post('/feed_data',(req, res, next) => {
    let pyOption = {
      mode: 'json',
      pythonPath: '',
      pythonOptions: ['-u'],
      scriptPath:'./public/py',
      args:[req.session.idname]
    }
    PythonShell.run('./feed-recommend.py',pyOption,(err, results)=>{
      if(err) {
        console.error(err);
      }
      let pyData = {
        id: req.session.idname,
        nickname:req.session.nickname,
        post: {},
        images: {},
      };
      db.query(`select post.*, post_content.content from post left join post_content on post.post_id = post_content.post_id;`, async (err, data)=>{
        let z =0;
        for(let j=0; j<results[0][req.session.idname].length; j++){ //for문을 반대로 돌리는 이유 :  { '조인태': [ 5, 4, 3 ] } 이런식으로 떠
        for(let i=0; i<data.length; i++) { // 전체 게시물 갯수 if 1~100개 까지 있어
          if(data[i].post_id == results[0][req.session.idname][j]){ //  { '조인태': [ 5 ] }
          pyData.post[z] = data[i];
          pyData.images[z] = await fs.readdir(`./public/data/${data[i].post_id}`)
          z++;
        }
      }
    }
    return res.end(JSON.stringify(pyData));
  })
}) 
})

// 피드 추천 라우터
app.get('/feed_recommend', async(req, res) => {
  // req.session.feedData = req.body;
  const data = await fs.readFile('./public/html/feed.html');
  return res.end(data);
  // db.query(`select post_likes.id, post_likes.post_id, post_likes.nickname, post_likes.likes_id from post_likes left join post_likes on post.post_id = post_likes.likes_id`, (err,data) => {
  })
  app.post('/feed_recommend', async(req,res, next) => {
    const feed = {
      post: {},
      images: {},
    }
    db.query(`select * from post `)
  })
  
  app.post('/feed_insert_comment', async (req, res, next)=>{
    const comment = req.body;
    db.query(`insert into post_comment (id, nickname, post_id, comment) values ('${req.session.idname}','${req.session.nickname}',${comment.postID},'${comment.comment_content}')`, (err, data) => {
      if (err) next(new Error('댓글 등록 실패'));
      return res.end();
    })
  })
  app.post('/feed_comment_data', async (req, res, next)=>{
    const post = req.body;
    db.query(`select * from post_comment where post_id = ${post.postID} order by upload_date asc`, (err, data) => {
      if (err) next(new Error('댓글 불러오기 오류'));
      return res.end(JSON.stringify(data));
    })
  })
  // 댓글 삭제
  app.post('/new_delete_comment', (req, res, next)=>{
    const data = req.body
    db.query(`delete from post_comment where post_id = ${data.postId} and upload_date='${data.date}' `, (err, result)=>{
      if(err) next(new Error('댓글 삭제 오류'))
      return res.end();
    })
  })
  // 댓글삭제 끝
  //피드추천 끝
  app.use((err, req, res, next) => {
    console.log(err);
    res.redirect('/error');
  })
  app.listen(3030, () => console.log('3030 포트 대기'))
