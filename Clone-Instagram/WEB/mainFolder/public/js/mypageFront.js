(async () => {
  let myPageAxios
  let myPageAxiosData
  let mainAxios
  let mainAxiosData
  let followerAxios
  let followerAxiosData
  let followAxios
  let followAxiosData
  const init = async () => {
    try {

      myPageAxios = await axios.post('/mypage');
      myPageAxiosData = await myPageAxios.data;
      mainAxios = await axios.get('/main_data');
      mainAxiosData = await mainAxios.data;
      followerAxios = await axios.get('/follower_length');
      followerAxiosData = await followerAxios.data;
      followAxios = await axios.get('/follow_length');
      followAxiosData = await followAxios.data;
    } catch (err) {
      window.location.reload()
    }
  }
  await init();
  const logoutBtn = document.querySelector('.logout');
  logoutBtn.addEventListener('click', async () => {
    const logout = await axios.get('/logout');
    if (logout.data.startsWith('logout')) {
      location.href = "/";
    }
  })

  let feedSlideItems = []
  const feedList = document.querySelector('.feed-list');
  const feedSlideList = document.querySelector('.feed-slide-list');
  const postLength = document.querySelector('.post-length');

  const userNickname = document.querySelector('.user-nickname');
  const followerLength = document.querySelector('.follower-length');
  const followLength = document.querySelector('.follow-length');
  const rightFeedNickname = document.querySelector('.right-feed-nickname');
  const rightFeedContents = document.querySelector('.right-feed-contents');
  const hidden = document.querySelector('.hidden');
  const rightFeedList = document.querySelector('.right-feed-list');
  const userNavImg = document.querySelector('.user_img');
  const profileImage = document.querySelector('.profileImage');
  const myPageHeader = document.querySelector('.my-page-header');
  const likeBtn = document.querySelector('.like-btn');
  const mypageFollowerList = document.querySelector('.mypage-follower-list');


  // 마이페이지 이미지 설정 및 사용자 정보 출력
  userNavImg.style.backgroundImage = `url('../data/${mainAxiosData.id}/1.jpg')`;
  profileImage.style.backgroundImage = `url('../data/${mainAxiosData.id}/1.jpg')`;
  userNickname.innerHTML = mainAxiosData.nick;
  postLength.innerHTML = myPageAxiosData.post.length;
  followerLength.innerHTML = followerAxiosData.length;
  followLength.innerHTML = followAxiosData.length;
  rightFeedNickname.innerHTML = mainAxiosData.nick;

  // 동적으로 게시글 li 생성
  for (let i = 0; i < myPageAxiosData.post.length; i++) {
    const feedItems = document.createElement('li');
    feedItems.dataset.post_id = myPageAxiosData.post[i].post_id;
    feedItems.dataset.imageCount = myPageAxiosData.images[i].length;
    feedItems.dataset.content = myPageAxiosData.post[i].content;
    feedItems.dataset.upload_date = myPageAxiosData.post[i].upload_date.split('T')[0];
    feedItems.className = 'feed-items';
    feedItems.style.backgroundImage = `url('../data/${myPageAxiosData.post[i].post_id}/1.jpg')`
    feedList.appendChild(feedItems);
  }
  const feedSlideContainer = document.querySelector('.feed-slide-container');
  const feedPostModalContainer = document.querySelector('.feed-post-modal-container');

  // 이벤트 위임
  const getTarget = (elem, className) => {
    while (!elem.classList.contains(className)) {
      elem = elem.parentNode;
      if (elem.nodeName == 'BODY') {
        elem = null;
        return;
      }
    }
    return elem;
  }

  const followercancelModalHandler = (e) => {
    if (e.target.className === `mypage-follower-modalcontainer`) {
      mypageFollowerModalcontainer.style.display = `none`;
      const followerList = document.querySelectorAll('.follower-list');
      for (let i = 0; i < followerList.length; i++) {
        followerList[i].remove();
      }
    }
  }
  const mypageFollowerModalcontainer = document.querySelector('.mypage-follower-modalcontainer');
  const followerList = document.querySelector('.follower-list');
  myPageHeader.addEventListener('click', async (e) => {
    const userSecession = getTarget(e.target, 'user-secession')
    const mypageFollower = getTarget(e.target, 'mypage-follower');
    const mypageFollow = getTarget(e.target, 'mypage-follow');

    let followerHTML = await fetch('../lib/followerlist');
    let followerText = await followerHTML.text();
    // 회원 탈퇴
    if (userSecession) {
      const password = window.prompt('비밀번호를 입력해주세요(확인 시 바로 탈퇴됩니다.)');
      const isTrue = await axios.post('/is_user', { password })
      const isTrueData = await isTrue.data;
      if (isTrueData.startsWith('true')) {
        await axios.post('/delete_user');
        window.location.href = '/';
        alert('탈퇴 되었습니다. 그동안 감사합니다.')
      } else {
        alert('비밀번호가 틀렸습니다.')
      }
    }
    // 팔로워 리스트
    else if (mypageFollower) {
      mypageFollowerModalcontainer.style.display = `flex`;

      for (let i = 0; i < followerAxiosData.length; i++) {
        mypageFollowerList.innerHTML += followerText;
        mypageFollowerList.children[i].children[0].style.backgroundImage = `url('../data/${followerAxiosData[i].id}/1.jpg')`;
        mypageFollowerList.children[i].children[1].children[0].innerHTML = followerAxiosData[i].nickname;
        mypageFollowerList.children[i].children[1].children[1].innerHTML = followerAxiosData[i].id;
        for (let j = 0; j < followAxiosData.length; j++) {
          if (followerAxiosData[i].id == followAxiosData[j].following_id) {
            mypageFollowerList.children[i].children[2].innerHTML = '팔로잉';
            mypageFollowerList.children[i].children[2].style.color = '#333';
            break;
          }
          else {
            mypageFollowerList.children[i].children[2].innerHTML = '팔로우';
            mypageFollowerList.children[i].children[2].style.color = 'dodgerblue';
          }
        }
      }
    }
    // 팔로우 리스트
    else if (mypageFollow) {
      mypageFollowerModalcontainer.style.display = `flex`;
      for (let i = 0; i < followAxiosData.length; i++) {
        mypageFollowerList.innerHTML += followerText;
        mypageFollowerList.children[i].children[0].style.backgroundImage = `url('../data/${followAxiosData[i].following_id}/1.jpg')`;
        mypageFollowerList.children[i].children[1].children[0].innerHTML = followAxiosData[i].nickname;
        mypageFollowerList.children[i].children[1].children[1].innerHTML = followAxiosData[i].following_id;
        mypageFollowerList.children[i].children[2].innerHTML = '팔로잉';
        mypageFollowerList.children[i].children[2].style.color = '#333'
      }
    }
  })

  await mypageFollowerModalcontainer.addEventListener('click', followercancelModalHandler);

  // 게시글 클릭시 동적으로 이미지 개수 만큼 li 생성
  feedList.addEventListener('click', async (e) => {
    const LslideSwitch = document.querySelector('.feed-slide-switch-left');
    const RslideSwitch = document.querySelector('.feed-slide-switch-right');
    const feedItem = getTarget(e.target, 'feed-items');
    if (feedItem) {
      for (let i = 0; i < feedItem.dataset.imageCount; i++) {
        if(feedItem.dataset.imageCount == 1) {
          LslideSwitch.style.display = 'none';
          RslideSwitch.style.display = 'none';
        } else {
          LslideSwitch.style.display = 'none';
          RslideSwitch.style.display = 'inline';
        }
        const feedSlideItems = document.createElement('li');
        feedSlideItems.className = 'feed-slide-items';
        feedSlideItems.style.backgroundImage = `url('../data/${feedItem.dataset.post_id}/${i + 1}.jpg')`;
        feedSlideList.appendChild(feedSlideItems);
      }
      feedPostModalContainer.style.opacity = '1';
      feedPostModalContainer.style.zIndex = 20;
    }

    hidden.value = feedItem.dataset.post_id;
    feedSlideItems = document.querySelectorAll('.feed-slide-items');
    feedSlideListWidth = feedSlideContainer.clientWidth * feedSlideItems.length;
    feedSlideList.style.width = `${feedSlideListWidth}px`;
    rightFeedContents.children[0].innerHTML = feedItem.dataset.content;
    rightFeedContents.children[1].innerHTML = feedItem.dataset.upload_date;

    // 댓글
    let commentAxios = await axios.post('/feed_comment_data', { postID: hidden.value });
    let commentAxiosData = commentAxios.data;

    let commentHTML = await fetch('../lib/mypagecomment');
    let commentText = await commentHTML.text();

    const rightFeedImage = document.querySelector('.right-feed-image');
    rightFeedImage.style.backgroundImage = `url('../data/${mainAxiosData.id}/1.jpg')`;

    for (let i = 0; i < commentAxiosData.length; i++) {
      if (feedItem.dataset.post_id == commentAxiosData[i].post_id) {
        rightFeedList.innerHTML += commentText;
        rightFeedList.children[i].children[0].style.backgroundImage = `url('../data/${commentAxiosData[i].id}/1.jpg')`;
        rightFeedList.children[i].children[1].innerHTML = commentAxiosData[i].nickname;
        rightFeedList.children[i].children[3].innerHTML = commentAxiosData[i].comment;
        rightFeedList.children[i].dataset.id = commentAxiosData[i].id;
        rightFeedList.children[i].dataset.post_id = commentAxiosData[i].post_id; const resultDate = commentAxiosData[i].upload_date.split('T');
        let hour
        let day = resultDate[0].split('-');
        if (new Date(commentAxiosData[i].upload_date).toLocaleString().split(' ')[3].startsWith('오후')) {

          hour = (parseInt(new Date(commentAxiosData[i].upload_date).toLocaleString().split(' ')[4].split(':')[0]) + 12).toString()
          if (hour === '24') {
            hour = (parseInt(hour) - 12).toString();
          }
        } else {
          hour = (new Date(commentAxiosData[i].upload_date).toLocaleString().split(' ')[4].split(':')[0]).toString();
          if (parseInt(hour) === 12 || parseInt(hour) < 9 && parseInt(hour) >= 1) {
            day[2] = (parseInt(day[2]) + 1).toString()
            day = day.join('-');
            resultDate[0] = day
          }
          if (hour.length === 1) {
            hour = '0' + hour;
          } else if (hour === '12') {
            hour = '00'
          }
        }
        resultDate[1] = new Date(commentAxiosData[i].upload_date).toLocaleString().split(' ')[4]
        const result = [hour, resultDate[1].split(':')[1], resultDate[1].split(':')[2]]
        resultDate[1] = result.join(':');
        const date = resultDate.join('T')
        rightFeedList.children[i].children[2].innerHTML = date.split('T')[0];
        rightFeedList.children[i].dataset.date = date
      };
    }
    // const rightFeedItem = document.querySelectorAll('.right-feed-items');


    // 좋아요
    const likeAxios = await axios.post('feed_like_process', { postID: hidden.value });
    const likeAxiosData = await likeAxios.data;
    if (likeAxiosData.data1.length !== 0) {
      likeBtn.setAttribute('fill', '#ed4956')
      likeBtn.children[0].setAttribute('d', "M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
      likeBtn.nextElementSibling.innerHTML = `${likeAxiosData.data2.length}명`;
    } else {
      likeBtn.setAttribute('fill', '#262626')
      likeBtn.firstElementChild.setAttribute('d', "M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
      likeBtn.nextElementSibling.innerHTML = `${likeAxiosData.data2.length}명`;
    }

  })

  // <li class="right-feed-items">
  //     <a href="" class="right-feed-image"></a>
  //     <p class="right-feed-nickname">whdlsxo123</p>
  //     <p class="right-feed-date">whdlsxo123</p>
  //     <p class="right-feed-comment">안녕하세요</p>
  // </li> 

  feedSlideList.style.left = 0;
  let listIndex = 0;
  feedPostModalContainer.addEventListener('click', async (e) => {
    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜
    const leftButton = getTarget(e.target, 'feed-slide-switch-left');
    const rightButton = getTarget(e.target, 'feed-slide-switch-right');
    const modalBox = getTarget(e.target, 'feed-post-modal-container');
    const slideBox = getTarget(e.target, 'feed-slide-container');
    const rightBox = getTarget(e.target, 'feed-post-right-section');
    const submit = getTarget(e.target, 'right-feed-bottom-submit');
    const likeBtn = getTarget(e.target, 'like-btn');
    const LslideSwitch = document.querySelector('.feed-slide-switch-left');
    const RslideSwitch = document.querySelector('.feed-slide-switch-right');
    const commentDeleteButton = getTarget(e.target, 'comment-delete-button');
    if (commentDeleteButton) {
      const postId = hidden.value;
      const date = commentDeleteButton.parentNode.dataset.date
      await axios.post('/new_delete_comment', { postId, date });
      commentDeleteButton.parentNode.remove();
    }

    // 좋아요 버튼 클릭 시
    if (likeBtn) {
      if (likeBtn.getAttribute('fill') == '#262626') {
        const likePostID = hidden.value;
        await axios.post('/add_like', { likePostID })
        likeBtn.setAttribute('fill', '#ed4956');
        likeBtn.children[0].setAttribute('d', "M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
        let likeCount = parseInt(likeBtn.nextElementSibling.innerHTML);
        likeBtn.nextElementSibling.innerHTML = `${++likeCount}명`;
      }
      else {
        const likePostID = hidden.value;
        await axios.post('/cancel_like', { likePostID });
        likeBtn.setAttribute('fill', '#262626')
        likeBtn.firstElementChild.setAttribute('d', "M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
        let likeCount = parseInt(likeBtn.nextElementSibling.innerHTML);
        likeBtn.nextElementSibling.innerHTML = `${--likeCount}명`
      }
    }

    // 댓글 입력후 등록버튼 클릭 시
    if (submit) {
      if (submit.previousElementSibling) {
        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
        const timezoneDate = new Date(Date.now() - timezoneOffset);
        const dbDate = timezoneDate.toISOString().slice(0, 19)
        await axios.post('/feed_insert_comment', { postID: hidden.value, comment_content: submit.previousElementSibling.value });
        const rightFeedItems = document.createElement('li');
        const rightFeedImage = document.createElement('a');
        const rightFeedNickname = document.createElement('p');
        const rightFeedDate = document.createElement('p');
        const rightFeedComment = document.createElement('p');
        const deleteButton = document.createElement('p');
        
        deleteButton.className = 'comment-delete-button'
        rightFeedItems.className = 'right-feed-items';
        rightFeedImage.className = 'right-feed-image';
        rightFeedNickname.className = 'right-feed-nickname';
        rightFeedDate.className = 'right-feed-comment-date';
        rightFeedComment.className = 'right-feed-comment';
        rightFeedImage.style.backgroundImage = `url('../data/${myPageAxiosData.post[0].id}/1.jpg')`;
        rightFeedNickname.innerHTML = myPageAxiosData.post[0].nickname;
        rightFeedDate.innerHTML = `${year}-${month}-${date}`;
        rightFeedComment.innerHTML = submit.previousElementSibling.value;
        deleteButton.innerHTML = '삭제'

        rightFeedItems.dataset.id = mainAxiosData.id;
        rightFeedItems.dataset.post_id = hidden.value;
        rightFeedItems.dataset.date = dbDate;
        rightFeedItems.appendChild(rightFeedImage);
        rightFeedItems.appendChild(rightFeedNickname);
        rightFeedItems.appendChild(rightFeedDate);
        rightFeedItems.appendChild(rightFeedComment);
        rightFeedItems.appendChild(deleteButton);
        rightFeedList.appendChild(rightFeedItems);
        submit.previousElementSibling.value = null;
      }
    }
    if (leftButton) {
      if (listIndex === 0) {
        return;
      }
      listIndex--;
      if(listIndex === 0 && feedSlideItems.length !== 1) {
        LslideSwitch.style.display = 'none'
        RslideSwitch.style.display = 'inline'
      } else if ( listIndex < feedSlideItems.length -1) {
        RslideSwitch.style.display = 'inline'
      }
      feedSlideList.style.left = `-${feedSlideContainer.clientWidth * listIndex}px`;
    } else if (rightButton) {
      if (listIndex === feedSlideItems.length - 1) {
        return;
      }
      listIndex++;
      if(listIndex === feedSlideItems.length -1) {
        RslideSwitch.style.display = 'none'
        LslideSwitch.style.display = 'inline'
      } else if(listIndex < feedSlideItems.length -1){
        LslideSwitch.style.display = 'inline'
        RslideSwitch.style.display = 'inline'
      }
      feedSlideList.style.left = `-${feedSlideContainer.clientWidth * listIndex}px`;
    } 
    else if (rightBox) {
    } else if (slideBox) {
    } else if (modalBox) {
      modalBox.style.opacity = '0';
      feedPostModalContainer.style.zIndex = 0;
      feedSlideList.style.left = 0;
      listIndex = 0;

      for (let i = 0; i < feedSlideItems.length; i++) {
        feedSlideItems[i].remove();
      }
      const commentItems = document.querySelectorAll('.right-feed-items');
      for (let i = 0; i < commentItems.length; i++) {
        commentItems[i].remove();
      }
      const likeBtn = document.querySelector('.like-btn');
      likeBtn.setAttribute('fill', '#262626')
      likeBtn.firstElementChild.setAttribute('d', "M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
      likeBtn.nextElementSibling.innerHTML = `0명`;

    }

  })

  // 마이페이지 게시물 삭제
  const rightFeedHeader = document.querySelector('.right-feed-header');
  const userModal_container = document.querySelector('.userModal-container');
  const cancelModalHandler = (e) => {
    if (e.target.className === `userModal-container` || e.target.className === `userModal-menu cancle`) {
      userModal_container.style.display = `none`;
    }
  }
  rightFeedHeader.addEventListener('click', (e) => {
    const modalButton = getTarget(e.target, 'modal-button');
    if (modalButton) {
      userModal_container.style.display = 'flex';
    }
  })

  userModal_container.addEventListener('click', cancelModalHandler);

  const delfeedItems = document.querySelectorAll('.feed-items');
  const deletePost = document.querySelector('#delete-post');
  deletePost.addEventListener('click', async () => {
    const id = hidden.value;
    await axios.post('/new_delete', { id });
    userModal_container.style.display = "none";
    feedPostModalContainer.style.zIndex = 0;
    feedPostModalContainer.style.opacity = '0';
    for (let i = 0; i < delfeedItems.length; i++) {
      if (delfeedItems[i].dataset.post_id == id) {
        delfeedItems[i].remove();
      }
    }
  })

  feedPostModalContainer.addEventListener('mouseover', (e) => {
    let commentItems;
    if (e.target.className == 'right-feed-items') commentItems = e.target;
    if (commentItems) {
      if (commentItems.dataset.id === mainAxiosData.id) {
        commentItems.children[4].style.display = "inline"
      }
    }
  })
  feedPostModalContainer.addEventListener('mouseout', (e) => {
    let commentItems;
    if (e.target.className == 'right-feed-items') commentItems = e.target;
    if (commentItems) {
      if (commentItems.dataset.id === mainAxiosData.id) {
        commentItems.children[4].style.display = "none"
      }
    }
  })

  window.addEventListener('resize', () => {
    const LslideSwitch = document.querySelector('.feed-slide-switch-left');
    const RslideSwitch = document.querySelector('.feed-slide-switch-right');
    if(feedSlideItems.length === 1){
      LslideSwitch.style.display = 'none';
      RslideSwitch.style.display = 'none';

    }else {
      LslideSwitch.style.display = 'none';
      RslideSwitch.style.display = 'inline';
    }

    feedSlideListWidth = feedSlideContainer.clientWidth * feedSlideItems.length;
    feedSlideList.style.width = `${feedSlideListWidth}px`;
    feedSlideList.style.left = 0;
    listIndex = 0;
    
  })
})()