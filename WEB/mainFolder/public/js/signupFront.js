(async ()=>{
    const userId = await axios.post('/signup_get_id');
    const userIdData = await userId.data;

    const signupBox = document.querySelector('.signup-box');
    const toastMessage = document.querySelector('.toast-message');
    const submit = document.querySelector('.submit')
    let isAble = {
        id: false,
        name: false,
        nickname: false,
        password: false,
    }
    signupBox.addEventListener('change', e=>{
        let id;
        let name;
        let nickname;
        let password;
        let idIsOverlap = false;
        let nicknameIsOverlap = false

        if(e.target.name=='id') id = e.target;
        if(e.target.name=='name') name = e.target;
        if(e.target.name=='nickname') nickname = e.target;
        if(e.target.name=='password') password = e.target;
        if(id) {
            for(let i=0; i<userIdData.length; i++){
                if(userIdData[i].id == id.value) idIsOverlap = true;
            }
            if(id.value.length < 6){
                id.style.border = '2px solid #ff3333'
                toastMessage.innerHTML = '6자 이상 입력해주세요.'
                toastMessage.style.opacity = '1'
                isAble.id = false;

            } else if(idIsOverlap){
                id.style.border = '2px solid #ff3333'
                toastMessage.style.opacity = '1'
                toastMessage.innerHTML = '아이디가 중복됩니다.'
                isAble.id = false;
            } 
            else {
                id.style.border = '2px solid #66ff33'
                toastMessage.style.opacity = '0'
                isAble.id = true;
            }
        }
        if(name) {
            if(name.value.length < 2){
                name.style.border = '2px solid #ff3333'
                toastMessage.innerHTML = '2자 이상 입력해주세요.'
                toastMessage.style.opacity = '1'
                isAble.name = false;

            } else {
                name.style.border = '2px solid #66ff33'
                toastMessage.style.opacity = '0'
                isAble.name = true;
            }
            
        }
        if(nickname) {
            for(let i=0; i<userIdData.length; i++){
                if(userIdData[i].nickname == nickname.value) nicknameIsOverlap = true;
            }
            if(nickname.value.length < 4){
                nickname.style.border = '2px solid #ff3333'
                toastMessage.innerHTML = '4자 이상 입력해주세요.'
                toastMessage.style.opacity = '1'
                isAble.nickname = false;
            } else if(nicknameIsOverlap){
                nickname.style.border = '2px solid #ff3333'
                toastMessage.style.opacity = '1'
                toastMessage.innerHTML = '닉네임이 중복됩니다.'
                isAble.nickname = false;
            } 
            else {
                nickname.style.border = '2px solid #66ff33'
                toastMessage.style.opacity = '0'
                isAble.nickname = true;
            }
        }
        if(password) {
            if(password.value.length < 4){
                password.style.border = '2px solid #ff3333'
                toastMessage.innerHTML = '4자 이상 입력해주세요.'
                toastMessage.style.opacity = '1'
                isAble.password = false;
            } else {
                password.style.border = '2px solid #66ff33'
                toastMessage.style.opacity = '0'
                isAble.password = true;
            }
        }
        if(isAble.id&&isAble.nickname&&isAble.name&&isAble.password){
            submit.disabled = false;
            submit.style.backgroundColor= 'rgb(113, 184, 255)';
        } else {
            submit.disabled = true;
            submit.style.backgroundColor= 'rgb(186, 216, 247)';
        }
    })
})()