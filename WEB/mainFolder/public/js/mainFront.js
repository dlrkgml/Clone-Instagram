(()=>{

  const logoutBtn = document.querySelector('.logout');
  const navImage = document.querySelector('.user_img');
  const leftWholePage = document.querySelector('.whole-left-section');
  
  const postCommentUlTag = {};
  // 서버와 주고받는 데이터들.
  let main;
  let mainAxios; 
  let mainAxiosID;
  let mainAxiosImages;
  let mainAxiosPost;
  let commentData;
  let commentDataAxios;
  let likeData;
  let likeDataAxios;
  let likeDataAxiosMy;
  let likeDataAxiosAll;
  let friend;
  let friendData=['0'];
  // 로그아웃 설정
  
  leftWholePage.addEventListener('click', (e)=>{
    const viewMore = getTarget(e.target, 'view-more');
    if(viewMore) {
      
      if(viewMore.parentNode.children[1].style.whiteSpace === 'nowrap' || !viewMore.parentNode.children[1].style.whiteSpace){
        viewMore.parentNode.children[1].style.whiteSpace = "normal";
        viewMore.innerHTML ="닫기"
      }else {
        viewMore.parentNode.children[1].style.whiteSpace = "nowrap";
        viewMore.innerHTML ="더 보기"
      }
    }
  })
  logoutBtn.addEventListener('click', async () => {
    const logout = await axios.get('/logout');
    if (logout.data.startsWith('logout')) {
      location.href = "/";
    }
  })
  document.querySelector('.DM').addEventListener('click', async () => {
    const logout = await axios.get('/logout');
    if (logout.data.startsWith('logout')) {
      location.href = "/";
    }
  })
  
  navImage.addEventListener('click', async () => {
    const myPage = await axios.get('/mypage');
  })
  //  슬라이드 HTML 동적생성
  async function createSlideHTML() {
    try {
      const slideSticker = document.querySelector('#sticker');
      let slide_text;
      const slideHTML = await fetch('../lib/slide');
      if (slideHTML.status === 200) {
        slide_text = await slideHTML.text();
      };
      for (let i = 0; i < mainAxiosPost.length; i++) {
        slideSticker.innerHTML += slide_text;
      }
    } catch( err) {
      createSlideHTML(mainAxiosPost);
    }
  }
  //  우측 사이드 프로필 설정
  async function createRightHTML() {
    const userInfo = document.querySelector('.side_user_info')
    
    // 우측 사이드 프로필
    userInfo.children[0].innerHTML = mainAxios.nick;
    userInfo.children[1].innerHTML = mainAxios.name;
    // document.querySelector('.side_img').setAttribute('src', `./${mainAxiosID}/${mainAxios.profile[0]}`);
    if(mainAxios.profile.length !==0){
      document.querySelector('.profile-image-label').style.backgroundImage = `url('../data/${mainAxiosID}/${mainAxios.profile[0]}')`
      navImage.style.backgroundImage = `url('../data/${mainAxiosID}/${mainAxios.profile[0]}')`
    }
  }
  // 포스트 별로 slide-item <li> 태그설정
  async function createSlideList(){
    const postWhole = document.querySelectorAll('.post-whole');
    let z = Object.keys(mainAxiosImages).length - 1;
    for (const liList in mainAxiosImages) {
      for (let i = 0; i < mainAxiosImages[liList].length; i++) {
        const li = document.createElement('li');
        li.className = 'slide-item';
        postWhole[z].children[1].firstElementChild.firstElementChild.appendChild(li);
      }
      z--;
    }
  }
  // 슬라이드에 이미지 설정
  async function createSlideImage() {
    const postWhole = document.querySelectorAll('.post-whole')
    let img_index = Object.keys(mainAxiosImages).length - 1;
    for (const imgList in mainAxiosImages) {
      for (let i = 0; i < mainAxiosImages[imgList].length; i++) {
        postWhole[img_index].children[1].firstElementChild.firstElementChild.children[i].style.backgroundImage = `url('../data/${imgList}/${mainAxiosImages[imgList][i]}')`;
      }
      img_index--;
    }
  }
  
  // 슬라이드에 대부분 설정 ex) id, image, content
  async function settingSlider() {
    const postWhole = document.querySelectorAll('.post-whole')
    const postHeaderId = {};
    const postHeaderImage = {};
    const postContentId = {};
    const postContentText = {};
    const postContentDate = {};
    for (let i = 0; i < postWhole.length; i++) {
      postWhole[i].id = `${mainAxiosPost[(postWhole.length - 1) - i].id}-${mainAxiosPost[(postWhole.length - 1) - i].post_id}`;    // 삭제및 수정 기능구현을 위한 각 게시판별로 사용자 아이디와 연결
      postHeaderId[i] = postWhole[i].children[0].children[1].children[0]
      postHeaderId[i].innerHTML = mainAxiosPost[(postWhole.length - 1) - i].nickname;
      postContentId[i] = postWhole[i].children[3].children[0];
      postContentId[i].innerHTML = mainAxiosPost[(postWhole.length - 1) - i].nickname;
      postContentText[i] = postWhole[i].children[3].children[1];
      postContentText[i].innerHTML = mainAxiosPost[(postWhole.length - 1) - i].content;
      postContentDate[i] = postWhole[i].children[3].children[3];
      postContentDate[i].innerHTML = mainAxiosPost[(postWhole.length - 1) - i].upload_date.split('T')[0];
      postHeaderImage[i] = postWhole[i].children[0].children[0].children[0];
      postHeaderImage[i].style.backgroundImage = `url('../data/${mainAxiosPost[(postWhole.length - 1) - i].id}/${mainAxios.profile[0]}')`
    }
    
  }
  // comment <li> 설정
  async function createCommentFile() {
    const postWhole = document.querySelectorAll('.post-whole');
    
    let commentHTML;
    let comment_text;
    try {
      commentHTML = await fetch('../lib/comment');
      comment_text = await commentHTML.text();
      for (let i = 0; i < postWhole.length; i++) {
        postCommentUlTag[i] = postWhole[i].children[4].children[1]
        for (let j = 0; j < commentDataAxios.length; j++) {
          if (postWhole[i].id.split('-')[1] == commentDataAxios[j].post_id) {
            postCommentUlTag[i].innerHTML += comment_text;
          }
        }
      }
    } catch(err){
      
    }
  }
  
  // comment 데이터 설정
  async function createCommentHTML() {
    const postWhole = document.querySelectorAll('.post-whole')
    
    commentData = await axios.get('/comment_data');
    commentDataAxios = await commentData.data;
    const postCommentInputTag = {};
    let commentIndex = 0;
    
    for (let i = 0; i < postWhole.length; i++) {
      
      postCommentInputTag[i] = postWhole[i].children[4].children[2].children[0];
      postCommentInputTag[i].value = mainAxiosPost[(postWhole.length - 1) - i].post_id;  // 가려진 input태그로 post_id전송
      for (let j = 0; j < commentDataAxios.length; j++) {
        if (postWhole[i].id.split('-')[1] == commentDataAxios[j].post_id) {
          postCommentUlTag[i].children[commentIndex].children[0].innerHTML = commentDataAxios[j].nickname;
          postCommentUlTag[i].children[commentIndex].children[1].innerHTML = commentDataAxios[j].comment;
          postCommentUlTag[i].children[commentIndex].children[3].innerHTML = commentDataAxios[j].upload_date.split('T')[0];
          commentIndex++;
        };
      }
      commentIndex = 0;
    }
  }
  // 커멘트 삭제
  async function deleteComment() {
    const commentDeleteButton = document.querySelectorAll('.comment-delete');
    const commentList = document.querySelectorAll('.comment-item');
    for(let i=0; i<commentDataAxios.length; i++){
      if(mainAxios.nick === commentDataAxios[i].nickname) {
        commentList[i].addEventListener("mouseover",()=>{
          commentDeleteButton[i].style.display = 'inline';
        })
        commentList[i].addEventListener("mouseout",()=>{
          commentDeleteButton[i].style.display = 'none';
        })
        commentDeleteButton[i].addEventListener('click',async ()=>{
          const nickname = commentDataAxios[i].nickname;
          const postId = commentDataAxios[i].post_id;
          const tempDate = commentDataAxios[i].upload_date.split('T');
          let hour
          if(new Date(commentDataAxios[i].upload_date).toLocaleString().split(' ')[3].startsWith('오후')){
            hour = (parseInt(new Date(commentDataAxios[i].upload_date).toLocaleString().split(' ')[4].split(':')[0])+12).toString()
          } else {
            hour = ('0'+new Date(commentDataAxios[i].upload_date).toLocaleString().split(' ')[4].split(':')[0]).toString()
          }
          tempDate[1] = new Date(commentDataAxios[i].upload_date).toLocaleString().split(' ')[4];
          const result = [hour, tempDate[1].split(':')[1],tempDate[1].split(':')[2]]
          tempDate[1] = result.join(':');
          const date = tempDate.join('T');
          try{
            await axios.post('/new_delete_comment', { postId, date });
            commentList[i].remove();
          } catch(err) {
            console.error(err);
            alert('댓글 삭제 실패 - retry');
            // document.location.reload(true);
          }
        })
      }
    }
  }
  // 게시물 삭제
  async function deletePost() {
    const postWhole = document.querySelectorAll('.post-whole');
    const userModal_container = document.querySelector('.userModal-container');
    const deletePost = document.querySelector('#delete-post');
    deletePost.addEventListener('click', async () => {
      const userModalBox = document.querySelector('.userModal-box');
      const deleteData = await axios.post('/new_delete',{id: deletePost.previousElementSibling.value});
      userModal_container.style.display="none";
      for(let i=0; i<postWhole.length; i++) {
        if(postWhole[i].id.split('-')[1] == userModalBox.children[0].value){
          postWhole[i].remove();
        }
      }
    })
  }
  // 스토리 html 설정
  async function createStoryHTML() {
    const postWhole = document.querySelectorAll('.post-whole');
    const storyLeftButton = document.createElement('input');
    const storyRightButton = document.createElement('input');
    const storyBox = document.querySelector('.box');
    storyLeftButton.value = '‹'
    storyRightButton.value = '›'
    storyLeftButton.setAttribute('type', 'button');
    storyRightButton.setAttribute('type', 'button');
    storyLeftButton.className = 'story-switch story-switch-left';
    storyRightButton.className = 'story-switch story-switch-right';
    let storyHTML;
    let storyText;
    try{
      storyHTML = await fetch('../lib/story');
    } catch(err){
      document.location.reload(true);
    }
    storyText = await storyHTML.text();
    for (let i = 0; i < postWhole.length; i++) {
      storyBox.innerHTML += storyText;
    }
    const storyProfile = document.querySelectorAll('.itembox');
    for (let i = 0; i < postWhole.length; i++) {
      storyProfile[i].children[0].children[0].setAttribute('src', `../data/${mainAxiosPost[(postWhole.length - 1) - i].id}/${mainAxios.profile[0]}`)
      storyProfile[i].children[0].setAttribute('href', `#${postWhole[i].id}`)
      storyProfile[i].children[1].innerHTML = `${mainAxiosPost[(postWhole.length - 1) - i].nickname}`;
    }
    storyBox.insertBefore(storyLeftButton, storyBox.firstChild);
    storyBox.appendChild(storyRightButton);
    // story.js 내용
    //window DOM 객체
    const storyRightBtn = document.querySelector(".story-switch-right");
    const storyLeftBtn = document.querySelector(".story-switch-left");
    let j = 0;
    storyRightBtn.addEventListener("click", () => {
      j = 0;
      const time = setInterval(() => {
        storyBox.scrollLeft += 10;
        if (j === 20) clearInterval(time);
        j++;
      }, 5);
    });
    
    storyLeftBtn.addEventListener("click", () => {
      j = 0;
      const time = setInterval(() => {
        storyBox.scrollLeft -= 10;
        if (j === 20) clearInterval(time);
        j++;
      }, 5);
    });
  }
  
  // 슬라이드 좌우 이동 설정
  async function operateSlider() {
    const postWhole = document.querySelectorAll('.post-whole');
    const LslideSwitch = document.querySelectorAll('.slide-switch-left');
    const RslideSwitch = document.querySelectorAll('.slide-switch-right');
    const allPost = {};
    let slideLength = {};
    let slideIndex = {};
    const container = document.querySelector(".container");
    let containerWidth = container.clientWidth;
    
    for (let i = 0; i < postWhole.length; i++) {
      allPost[i] = postWhole[i].children[1].firstElementChild.firstElementChild;
      slideLength[i] = allPost[i].children.length;
      allPost[i].style.left = `0px`;
      allPost[i].style.width = (containerWidth * slideLength[i]) + 'px';
      slideIndex[i] = 0;
      LslideSwitch[i].style.display="none";
      if(slideLength[i]==1){
        LslideSwitch[i].style.display="none";
        RslideSwitch[i].style.display="none";
      }
      LslideSwitch[i].addEventListener('click', () => {
        if (slideIndex[i] === 0) {
          return;
        }
        slideIndex[i]--;
        allPost[i].style.left = -(containerWidth * slideIndex[i]) + 'px';
        if(slideIndex[i] === 0){
          LslideSwitch[i].style.display="none";
          RslideSwitch[i].style.display = "inline"
          
        } else {
          RslideSwitch[i].style.display = "inline"
        }
      })
      RslideSwitch[i].addEventListener('click', () => {
        
        if (slideIndex[i] === slideLength[i] - 1) {
          return;
        }
        allPost[i].style.left = -(containerWidth * (slideIndex[i] + 1)) + 'px';
        slideIndex[i]++;
        if(slideIndex[i]> 0){
          LslideSwitch[i].style.display="inline";
        }
        if(slideIndex[i]===slideLength[i] - 1){
          RslideSwitch[i].style.display = "none"
        }
      })
    }
    const postUserContent = document.querySelectorAll('.post-user-content');
    const viewMoreElem = document.querySelectorAll('.view-more');
    for(let i=0; i<postUserContent.length; i++){
      if((postUserContent[i].clientWidth / containerWidth) < 0.48){
        viewMoreElem[i].style.display="none"
      }
    }
    window.addEventListener('resize', () => {
      containerWidth = container.clientWidth;
      
      for (let i = 0; i < postWhole.length; i++) {
        if(slideLength[i] == 1) {
          LslideSwitch[i].style.display="none";
          RslideSwitch[i].style.display="none";
        } else {
          RslideSwitch[i].style.display = "inline"
          LslideSwitch[i].style.display="none";
        }
        allPost[i].style.width = `${containerWidth * slideLength[i]}px`;
        allPost[i].style.left = `0px`;
        slideIndex[i] = 0;
        if((postUserContent[i].clientWidth / containerWidth) < 0.48){
          viewMoreElem[i].style.display="none"
        } else{
          viewMoreElem[i].style.display="inline-block"
        }
      }
    });
  }
  
  // 게시물 모달창 설정
  async function operateModal() {
    const postWhole = document.querySelectorAll('.post-whole');
    const modalSVG = {};
    for (let i = 0; i < postWhole.length; i++) {
      modalSVG[i] = postWhole[i].children[0].children[2].children[0];
    }
    const modal_container = document.querySelector('.modal-container');
    const userModal_container = document.querySelector('.userModal-container');
    const cancelModalHandler = (e) => {
      if (e.target.className === `modal-container` || e.target.className === `modal-menu cancle`) {
        modal_container.style.display = `none`;
      } else if (e.target.className === `userModal-container` || e.target.className === `userModal-menu cancle`) {
        userModal_container.style.display = `none`;
      }
    }
    for (let i = 0; i < postWhole.length; i++) {
      modalSVG[i].addEventListener('click', async (e) => {
        let userPostId = e.currentTarget.parentNode.parentNode.parentNode.id.split('-');
        if (userPostId[0] === mainAxiosID) {
          const userModalBox = document.querySelector('.userModal-box');
          const id = modalSVG[i].parentNode.parentNode.parentNode.id.split('-')[1];
          userModalBox.children[0].value = id;
          userModal_container.style.display = 'flex';
        } else {
          modal_container.style.display = `flex`;
        }
      });
    }
    modal_container.addEventListener('click', cancelModalHandler);
    userModal_container.addEventListener('click', cancelModalHandler);
  }
  
  // 좋아요 설정
  async function operateLikes() {
    const postWhole = document.querySelectorAll('.post-whole');
    const postLikes = {};
    const likePeople ={};
    const likesCount = {};
    
    let likeCount = 0;
    for(let i=0; i<postWhole.length; i++){
      postLikes[i] = postWhole[i].children[2].children[0].children[0];
      for(let j=0; j<likeDataAxiosMy.length; j++){
        if(postWhole[i].id.split('-')[1] == likeDataAxiosMy[j].post_id) {
          postLikes[i].setAttribute('fill', '#ed4956')
          postLikes[i].firstElementChild.setAttribute('d', "M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
        }
      }
    }
    for(let i=0; i<postWhole.length; i++){
      for(let j=0; j<likeDataAxiosAll.length; j++){
        if(postWhole[i].id.split('-')[1] == likeDataAxiosAll[j].post_id) {
          likeCount++;
          postWhole[i].children[2].children[0].children[1].innerHTML = `${likeCount}명`;
        }
      }
      likeCount = 0;
    }
    for (let i = 0; i < postWhole.length; i++) {
      
      likePeople[i] = postWhole[i].children[2].children[0].children[1];
      likesCount[i] = parseInt(likePeople[i].innerText.split('명')[0]);
      postLikes[i].addEventListener('click', async () => {
        if (postLikes[i].getAttribute('fill') === '#262626') {
          const likePostID = postWhole[i].id.split('-')[1];
          await axios.post('/add_like', {likePostID});
          postLikes[i].setAttribute('fill', '#ed4956')
          postLikes[i].firstElementChild.setAttribute('d', "M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
          
          likePeople[i].innerHTML = `${++likesCount[i]}명`;
          
        } else {
          const likePostID = postWhole[i].id.split('-')[1];
          await axios.post('/cancel_like', {likePostID});
          postLikes[i].setAttribute('fill', '#262626')
          postLikes[i].firstElementChild.setAttribute('d', "M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z")
          
          likePeople[i].innerHTML = `${--likesCount[i]}명`;
        }
      })
    }
    
  }
  const getTarget = (elem, className) =>{
    while(!elem.classList.contains(className)){
      elem = elem.parentNode;
      if(elem.nodeName == 'BODY') {
        elem = null;
        return;
      }
    }
    return elem;
  }
  async function operateFollowing() {
    const side = document.querySelector('.side');
    side.addEventListener('click', async (e)=>{
      const followBtn = getTarget(e.target, 'follow_button');
      if(followBtn){
        if(followBtn.innerHTML == '팔로우') {
          followBtn.innerHTML = '팔로잉'
          followBtn.style.color = '#333';
          const idData = followBtn.parentNode.parentNode.children[1].children[1].innerHTML;
          await axios.post('/right_add_following',{idData});
        }
        else {
          const idData = followBtn.parentNode.parentNode.children[1].children[1].innerHTML;
          followBtn.innerHTML = '팔로우'
          followBtn.style.color = 'dodgerblue';
          await axios.post('/right_cancel_following',{idData});
        }
      }
    })
  }
  async function setFriendData() {
    friend = await axios.get('/main_friend');
    friendData = await friend.data;

    console.log(friendData)
    if(friendData[0].length !== 0){
      
      const sideSticker = document.querySelector('.side-sticker');
      for(const name in friendData[0]) {
        const rightHTML = await fetch('../lib/rightFriend');
        const rightHTMLCotent = await rightHTML.text();
        sideSticker.innerHTML += rightHTMLCotent;
      }
      let x = 0;
      const recommendInfo = document.querySelectorAll('.recommend_info');
      const sideUserImage = document.querySelectorAll('.side_user_img_recommend');
      const data = friendData[0]
      const nickname = await axios.post('/nickData', data);
      const nicknameData = await nickname.data;
      for(const name in friendData[0]){
        sideUserImage[x].children[0].children[0].style.backgroundImage = `url('../data/${name}/1.jpg')`;
        recommendInfo[x].children[0].innerHTML = nicknameData[x];
        recommendInfo[x].children[1].innerHTML = name;
        x++;
      }
    }
  }
  
  //데이터 초기화
  async function initializeData() {
    try{
      commentData = await axios.get('/comment_data');
      commentDataAxios = await commentData.data;
      main = await axios.get('/main_data');
      mainAxios = await main.data;
      mainAxiosID = await mainAxios.id;
      mainAxiosImages = await mainAxios.images;
      mainAxiosPost = await mainAxios.post;
      likeData  = await axios.get('/like_process');
      likeDataAxios = await likeData.data;
      likeDataAxiosMy = await likeDataAxios.data1;
      likeDataAxiosAll = await likeDataAxios.data2;

    } catch (err){
      document.location.reload(true);
    }
  }
  leftWholePage.addEventListener('click',async (e)=>{
    const main = await axios.get('/main_data')
    const mainAxios = await main.data;
    const insertComment = getTarget(e.target, 'comment-submit');
    if(insertComment) {
      const postID = insertComment.previousElementSibling.previousElementSibling.value
      const comment_content = insertComment.previousElementSibling.value
      if(comment_content.length !== 0) {
        await axios.post('/insert_comment',{postID, comment_content})
        /**
         * <li class="comment-item">
            <a href="" class="comment-list-link">ID</a>
            <span class="comment-list-content">Content</span>
            <span class="comment-delete">삭제</span>
            <span class="comment-date">날짜</span>
          </li>
         */
        const commentItems = document.createElement('li');
        const commentLink = document.createElement('a');
        const commentContent = document.createElement('span');
        const commentDelete = document.createElement('span');
        const commentDate = document.createElement('span');
        commentItems.className = 'comment-item'
        commentLink.className = 'comment-list-link'
        commentContent.className = 'comment-list-content'
        commentDelete.className = 'comment-delete'
        commentDate.className = 'comment-date'
        commentLink.innerHTML = mainAxios.nick;
        commentContent.innerHTML = comment_content;
        commentDelete.innerHTML = '삭제'
        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
        const timezoneDate = new Date(Date.now() - timezoneOffset);
        const dbDate = timezoneDate.toISOString().slice(0, 19)
        commentDate.innerHTML = `${dbDate.split('T')[0]}`
        commentItems.appendChild(commentLink)
        commentItems.appendChild(commentContent)
        commentItems.appendChild(commentDelete)
        commentItems.appendChild(commentDate)
        insertComment.parentNode.previousElementSibling.appendChild(commentItems);
        insertComment.previousElementSibling.value = null;
      }
    }
  })
  window.addEventListener('load', async () => {
    await initializeData();
    
    
    await createRightHTML();

    // 게시물이 한개 이상일때 실행
    if (mainAxiosPost.length !== 0) {
      
      await createSlideHTML();
      // 게시물 별 이미지 개수에 따른 li 설정
      await createSlideList();
      // slide-item에 이미지 설정
      await createSlideImage()
      await settingSlider()
      await createCommentFile()
      await createCommentHTML()
      await deleteComment()
      await createStoryHTML()
      await operateSlider();
      await operateModal();
      await deletePost()
      await operateLikes();

      
    }
    setFriendData();
    operateFollowing()
    // 게시글 작성 모달
    const insertBox = document.querySelector('.insert-box');
    const insertButton = document.querySelector('.insert-button');
    let isView = false;
    insertButton.addEventListener('click', (e) => {
      if (!isView) {
        insertBox.style.display = "flex";
        isView = true;
      } else {
        insertBox.style.display = "none";
        isView = false;
      }
    })
    insertBox.addEventListener('click', (e) => {
      if (e.target.className === 'insert-box') {
        insertBox.style.display = "none";
        isView = false;
      }
    })
  });
})()