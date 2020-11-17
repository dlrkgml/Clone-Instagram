(async ()=>{
	let feedAxios
	let feedAxiosData
	const feedList = document.querySelector('.feed-list');
	const feedSlideList = document.querySelector('.feed-slide-list');
	const hidden = document.querySelector('.hidden');
	const rightFeedList = document.querySelector('.right-feed-list');
	const likeBtn = document.querySelector('.like-btn');
	const init = async () => {
		try{
			feedAxios = await axios.post('/feed_data');
			feedAxiosData = await feedAxios.data;
		} catch(err){
			window.location.reload();
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
	const userImg = document.querySelector('.user_img');
	userImg.style.backgroundImage = `url('../data/${feedAxiosData.id}/1.jpg')`;
	

	// 동적으로 게시글 이미지 li생성
	for( let i = 0; i < Object.keys(feedAxiosData.post).length; i++) {
		const feedItems = document.createElement('li');
		feedItems.dataset.id = feedAxiosData.post[i].id; // ★dataset : feed하나를 선택했을때 누구 feed인지 아이디를 알려줘
		feedItems.dataset.post_id = feedAxiosData.post[i].post_id;
		feedItems.dataset.nickname = feedAxiosData.post[i].nickname;
		feedItems.dataset.content = feedAxiosData.post[i].content;
		feedItems.dataset.upload_date = feedAxiosData.post[i].upload_date.split('T')[0];
		feedItems.dataset.index = i;
		feedItems.className = 'feed-items';
		feedList.appendChild(feedItems);
		feedItems.style.backgroundImage = `url('../data/${feedAxiosData.post[i].post_id}/1.jpg')` // 첫 번째 이미지로 배경 설정 
	}
	const feedSlideContainer = document.querySelector('.feed-slide-container');
	let feedSlideItems;
	const feedPostModalContainer = document.querySelector('.feed-post-modal-container');
	const getTarget = (elem, className)=>{
		while(!elem.classList.contains(className)){
			elem = elem.parentNode;
			if(elem.nodeName == 'BODY'){
				elem = null;
				return;
			}
		}
		return elem;
	}

	// feed들 
	feedList.addEventListener('click', async(e)=>{
		const feedItem = getTarget(e.target, 'feed-items')
		if(feedItem){ // feed 하나를 클릭했을 때
			for(let i=0; i<feedAxiosData.images[feedItem.dataset.index].length; i++){  //1.jpg 2.jpg, 3.jpg -> 이미지 갯수만큼
				const feedSlideItems = document.createElement('li'); // 이미지 갯수만큼 슬라이드 li태그를 생성.
				feedSlideItems.className = 'feed-slide-items'; // 그 li 태그의 className이 'feed-slide-items'이고
				feedSlideList.appendChild(feedSlideItems); // Ul태그 'feed-slide-list'에 'feed-slide-items'를 붙여줘
				feedSlideItems.style.backgroundImage=`url('../data/${feedAxiosData.post[feedItem.dataset.index].post_id}/${feedAxiosData.images[feedItem.dataset.index][i]}')`
				// ${feedAxiosData.post[feedItem.dataset.index].post_id}은 몇 번째 게시물인지/ ${feedAxiosData.images[feedItem.dataset.index][i]}은 몇 번째 게시물의 1.jpg 2.jpg, 3.jpg
				feedSlideList.appendChild(feedSlideItems);

				if (feedAxiosData.images[feedItem.dataset.index].length == 1) {
                    const LslideSwitch = document.querySelector('.feed-slide-switch-left');
                    const RslideSwitch = document.querySelector('.feed-slide-switch-right');
                    LslideSwitch.style.display = 'none';
                    RslideSwitch.style.display = 'none';
                }else {
                    const LslideSwitch = document.querySelector('.feed-slide-switch-left');
                    const RslideSwitch = document.querySelector('.feed-slide-switch-right');
                    LslideSwitch.style.display = 'none';
                    RslideSwitch.style.display = 'inline';
                }
			}
			const rightFeedHeader = document.querySelector('.right-feed-header');
			rightFeedHeader.children[0].style.backgroundImage=`url('../data/${feedItem.dataset.id}/1.jpg')` // feed 올린사람의 이미지
			rightFeedHeader.children[1].innerHTML = feedItem.dataset.nickname; // feed 올린사람의 닉네임 dataset을 이용했기 때문에 
			
			const rightFeedContents = document.querySelector('.right-feed-contents');
			rightFeedContents.children[0].innerHTML = feedItem.dataset.content;
			rightFeedContents.children[1].innerHTML = feedItem.dataset.upload_date;

			hidden.value = feedItem.dataset.post_id;
			feedSlideItems = document.querySelectorAll('.feed-slide-items');
			feedSlideListWidth = feedSlideContainer.clientWidth * feedSlideItems.length;
			feedSlideList.style.width = `${feedSlideListWidth}px`
			feedPostModalContainer.style.top=0;
			feedPostModalContainer.style.opacity= '1';
			feedPostModalContainer.style.zIndex=20;

			let feedCommentAxios = await axios.post('/feed_comment_data',{postID:hidden.value});
			let feedCommentAxiosData = feedCommentAxios.data;
			const likeAxios = await axios.post('feed_like_process',{postID:hidden.value});
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

			let feedCommentHTML = await fetch('../lib/feedcomment');
			let feedCommentHTMLText = await feedCommentHTML.text();
			const feedCommentUL = document.querySelector('.right-feed-list');
			
			for(let i =0; i< feedCommentAxiosData.length; i++) {
				feedCommentUL.innerHTML += feedCommentHTMLText;
				if(feedItem.dataset.post_id == feedCommentAxiosData[i].post_id) {
					feedCommentUL.children[i].children[0].style.backgroundImage = `url('../data/${feedCommentAxiosData[i].id}/1.jpg')`
					feedCommentUL.children[i].children[1].innerHTML = feedCommentAxiosData[i].nickname;
					feedCommentUL.children[i].children[3].innerHTML = feedCommentAxiosData[i].comment;
					feedCommentUL.children[i].dataset.id = feedCommentAxiosData[i].id;
					feedCommentUL.children[i].dataset.post_id = feedCommentAxiosData[i].post_id;
					const resultDate = feedCommentAxiosData[i].upload_date.split('T');
					let hour
					let day = resultDate[0].split('-');
					if(new Date(feedCommentAxiosData[i].upload_date).toLocaleString().split(' ')[3].startsWith('오후')){
	
						hour = (parseInt(new Date(feedCommentAxiosData[i].upload_date).toLocaleString().split(' ')[4].split(':')[0])+12).toString()
						if(hour === '24'){
							hour = (parseInt(hour) - 12).toString();
						}
					} else {
						hour = (new Date(feedCommentAxiosData[i].upload_date).toLocaleString().split(' ')[4].split(':')[0]).toString();
						if(parseInt(hour) === 12 || parseInt(hour) < 9 && parseInt(hour) >= 1){
							day[2] = (parseInt(day[2]) + 1 ).toString()
							day = day.join('-');
							resultDate[0] = day
						}
						if(hour.length === 1) {
							hour = '0'+ hour;
						} else if(hour ==='12'){
							hour = '00'
						}
					}
					resultDate[1] = new Date(feedCommentAxiosData[i].upload_date).toLocaleString().split(' ')[4]
					const result = [hour, resultDate[1].split(':')[1],resultDate[1].split(':')[2]]
					resultDate[1] = result.join(':');
					const date = resultDate.join('T')
					feedCommentUL.children[i].children[2].innerHTML = date.split('T')[0];
					feedCommentUL.children[i].dataset.date = date
				}
			}
			// const rightFeedItem = document.querySelectorAll('.right-feed-items');
		}
	})

	feedSlideList.style.left =0;
	let listIndex = 0;
	// feed 눌렀을때 모달 
	feedPostModalContainer.addEventListener('click', async(e)=>{
		let today = new Date();
		let year = today.getFullYear(); // 년도
		let month = today.getMonth() + 1; // 월
		let date = today.getDate(); //  날짜
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
        if(commentDeleteButton) {
            const postId = hidden.value;
            const date = commentDeleteButton.parentNode.dataset.date
            await axios.post('/new_delete_comment', {postId, date});
            commentDeleteButton.parentNode.remove();
        }
		if (likeBtn) {
			if (likeBtn.getAttribute('fill') == '#262626') {
				const likePostID = hidden.value;
				await axios.post('/add_like', {likePostID})
				likeBtn.setAttribute('fill', '#ed4956');
				likeBtn.children[0].setAttribute('d',"M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
				let likeCount = parseInt(likeBtn.nextElementSibling.innerHTML);
				likeBtn.nextElementSibling.innerHTML = `${++likeCount}명`;
			}
			else {
				const likePostID = hidden.value;
				await axios.post('/cancel_like', {likePostID});
				likeBtn.setAttribute('fill', '#262626')
				likeBtn.firstElementChild.setAttribute('d', "M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
				let likeCount = parseInt(likeBtn.nextElementSibling.innerHTML);
				likeBtn.nextElementSibling.innerHTML = `${--likeCount}명`
			}
		}

		// 댓글 
		if(submit) {
			if(submit.previousElementSibling) { // previousElementSibling() :  요소 노드로 이전 형제 노드를 반환.
			// <li class="right-feed-items">
		    // <a href="" class="right-feed-image"></a>
		    // <p class="right-feed-nickname">whdlsxo123</p>
		    // <p class="right-feed-date">whdlsxo123</p>
		    // <p class="right-feed-comment">안녕하세요</p>
			// </li> 
			const timezoneOffset = new Date().getTimezoneOffset() * 60000;
            const timezoneDate = new Date(Date.now() - timezoneOffset);
            const dbDate = timezoneDate.toISOString().slice(0, 19)
			let feedCommentAxios = await axios.post('/feed_comment_data',{postID:hidden.value});
			let feedCommentAxiosData = feedCommentAxios.data;
			await axios.post('/feed_insert_comment', {postID: hidden.value, comment_content: submit.previousElementSibling.value})
			const rightFeedItems = document.createElement('li');
			const rightFeedImage = document.createElement('a');
			const rightFeedNickname = document.createElement('p');
			const rightFeedDate = document.createElement('p');
			const rightFeedComment = document.createElement('p');
			const deleteButton = document.createElement('p');
			deleteButton.className = 'comment-delete-button'
			deleteButton.innerHTML = '삭제'
			rightFeedItems.dataset.id = feedAxiosData.id;
			rightFeedItems.dataset.post_id = hidden.value;
			rightFeedItems.dataset.date = dbDate;
			rightFeedItems.className = 'right-feed-items';
			rightFeedImage.className = 'right-feed-image';
			rightFeedNickname.className = 'right-feed-nickname';
			rightFeedDate.className = 'right-feed-comment-date';
			rightFeedComment.className = 'right-feed-comment';
			rightFeedImage.style.backgroundImage = `url('../data/${feedAxiosData.post[0].id}/1.jpg')`;
			rightFeedNickname.innerHTML = feedAxiosData.nickname;
			rightFeedDate.innerHTML = `${year}-${month}-${date}`;
			rightFeedComment.innerHTML = submit.previousElementSibling.value;
			rightFeedItems.appendChild(rightFeedImage)
			rightFeedItems.appendChild(rightFeedNickname)
			rightFeedItems.appendChild(rightFeedDate)
			rightFeedItems.appendChild(rightFeedComment)
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
            if (listIndex === 0 && feedSlideItems.length !== 1) {
                LslideSwitch.style.display = 'none'
                RslideSwitch.style.display = 'inline'
            } else if (listIndex < feedSlideItems.length - 1) {
                RslideSwitch.style.display = 'inline'
            }
            feedSlideList.style.left = `-${feedSlideContainer.clientWidth * listIndex}px`;
        } else if (rightButton) {
            if (listIndex === feedSlideItems.length - 1) {
                return;
            }
            listIndex++;
            if (listIndex === feedSlideItems.length - 1) {
                RslideSwitch.style.display = 'none'
                LslideSwitch.style.display = 'inline'
            } else if (listIndex < feedSlideItems.length - 1) {
                LslideSwitch.style.display = 'inline'
                RslideSwitch.style.display = 'inline'
            }
            feedSlideList.style.left = `-${feedSlideContainer.clientWidth * listIndex}px`;
        }
		else if(rightBox){
		}else if(slideBox){
		}else if(modalBox){
			feedSlideList.style.left = 0;
			listIndex=0;
			modalBox.style.opacity='0';
			feedPostModalContainer.style.top='4rem';
			feedPostModalContainer.style.zIndex=0;
			const slideItems = document.querySelectorAll('.feed-slide-items'); // feed 하나를 선택하고 닫고 또 다시 열면 이미지갯수 만큼 li태그가 또 생겨 -> 닫을때 3개를 삭제해줘.
			for(let i=0; i<slideItems.length; i++) {
				slideItems[i].remove();
			}
			const rightFeedItem = document.querySelectorAll('.right-feed-items');
			for(let i=0; i<rightFeedItem.length; i ++) {
				rightFeedItem[i].remove();
			}
			const likeBtn = document.querySelector('.like-btn');
			likeBtn.setAttribute('fill', '#262626')
      likeBtn.firstElementChild.setAttribute('d', "M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z");
      likeBtn.nextElementSibling.innerHTML = `0명`;
		}
	})
	feedPostModalContainer.addEventListener('mouseover', (e)=>{
        let commentItems;
        if(e.target.className == 'right-feed-items') commentItems = e.target;
        if(commentItems) {
            if(commentItems.dataset.id === feedAxiosData.id) {
                commentItems.children[4].style.display="inline"
            }
        }
    })
    feedPostModalContainer.addEventListener('mouseout', (e)=>{
        let commentItems;
        if(e.target.className == 'right-feed-items') commentItems = e.target;
        if(commentItems) {
            if(commentItems.dataset.id === feedAxiosData.id) {
                commentItems.children[4].style.display="none"
            }
        }
    })
	window.addEventListener('resize',()=>{
		const LslideSwitch = document.querySelector('.feed-slide-switch-left');
        const RslideSwitch = document.querySelector('.feed-slide-switch-right');
        if (feedSlideItems.length === 1) {
            LslideSwitch.style.display = 'none';
            RslideSwitch.style.display = 'none';

        } else {
            LslideSwitch.style.display = 'none';
            RslideSwitch.style.display = 'inline';
        }

		feedSlideListWidth = feedSlideContainer.clientWidth * feedSlideItems.length;
		feedSlideList.style.width = `${feedSlideListWidth}px`
		feedSlideList.style.left = 0;
		listIndex=0;
	})
})()