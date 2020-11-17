window.addEventListener('load', ()=>{
  loadFile();
})
async function loadFile() {
  const sendData = document.querySelector('.login-input'); // form 태그
  sendData.addEventListener('submit', async (e)=>{ // action = /login method = post
    e.preventDefault(); // 페이지 이동 x
    id = e.target.id.value;
    password = e.target.password.value;
    const login = await axios.post('/login', { id, password });

    if(login.data.startsWith('success')){
      try{
        location.href="/main";
      } catch (err) {
        location.href="/main";
      }
    } else {
      alert('아이디 / 비밀번호를 확인해주세요.');
      location.href="/";
    }
  });
}
