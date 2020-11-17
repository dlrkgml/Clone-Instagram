window.addEventListener('load', async ()=>{
  let search
  let searchData
  let main
  let mainData
  const init = async () =>{
    search = await axios.get('/search_data');
    searchData = await search.data;
    main = await axios.get('/main_data')
    mainData = await main.data
  }
  try{
    await init()
  }catch(err) {
    await init()
  }
  const searchBox = document.querySelector('.search-people-box');
  const searchUlTag = document.querySelector('.search-people-list');
  const navImage = document.querySelector('.user_img');
  navImage.style.backgroundImage = `url('../data/${mainData.id}/1.jpg')`
  let searchHTMLData;
  if(searchData.length === 0) {
    const noDataElement = document.createElement('p');
    noDataElement.style.fontSize="2rem";
    noDataElement.style.color="#666";
    noDataElement.style.width = "100%";
    noDataElement.style.textAlign ="center";
    noDataElement.innerHTML = '검색 결과가 없습니다.'
    searchBox.removeChild(searchUlTag);
    searchBox.insertBefore(noDataElement, searchBox.firstChild);
  } else {
    const searchHTML = await fetch('../lib/search');
    if (searchHTML.status === 200) {
      searchHTMLData = await searchHTML.text();
    };
    for(let i=0; i<searchData.length; i++){
      searchUlTag.innerHTML += searchHTMLData;

    }
    const searchLiTag = document.querySelectorAll('.search-people-item');
    for(let i=0; i<searchData.length; i++){
      searchLiTag[i].id = `${searchData[i].id}-${i}`
      searchLiTag[i].children[0].style.backgroundImage=`url('../data/${searchData[i].id}/1.jpg')`;
      searchLiTag[i].children[1].innerHTML = `${searchData[i].nickname}`;
      if(searchData[i].following_id) {
        searchLiTag[i].children[2].innerHTML = `팔로잉`
        searchLiTag[i].children[2].style.color="crimson";
      }else {
        searchLiTag[i].children[2].innerHTML = `팔로우`
      }
      searchLiTag[i].children[2].addEventListener('click', async ()=>{
        if(searchLiTag[i].children[2].innerHTML.startsWith('팔로우')){
          searchLiTag[i].children[2].innerHTML = '팔로잉'
          searchLiTag[i].children[2].style.color='crimson';
          const followingIndex = searchLiTag[i].id;
          await axios.post('/add_following', { followingIndex })
        } else {
          searchLiTag[i].children[2].innerHTML = '팔로우'
          searchLiTag[i].children[2].style.color='dodgerblue';
          const followingIndex = searchLiTag[i].id;
          await axios.post('/cancel_following', {followingIndex})
        }
      })
    }

  }
})

document.querySelector('.DM').addEventListener('click', async () => {
  const logout = await axios.get('/logout');
  if (logout.data.startsWith('logout')) {
    location.href = "/";
  }
})