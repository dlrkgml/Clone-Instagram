
//window DOM 객체
const storyRightBtn = document.querySelector(".story-switch-right");
const storyLeftBtn = document.querySelector(".story-switch-left");
const storyBox = document.querySelector(".box");
let j = 0;
// log(storyRightBtn);
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
