function increase() {
  let qty = document.getElementById("zero");
  let add = qty.innerHTML;
  if (add < 20) {
    add++;
    qty.textContent = add;
  }
}
function decrease() {
  let qty = document.getElementById("zero");
  let add = qty.innerHTML;
  if (add != 0) {
    add--;
    qty.textContent = add;
  }
}

let picIndex = 1;
addImage(picIndex);
function increaseSlide(n) {
  addImage((picIndex += n));
}
function addImage(n) {
  let i;
  let pictures = document.getElementsByClassName("mobilepics");
  if (n > pictures.length) {
    picIndex = 1;
  }
  if (n < 1) {
    picIndex = pictures.length;
  }
  for (i = 0; i < pictures.length; i++) {
    pictures[i].style.display = "none";
  }
  pictures[picIndex - 1].style.display = "block";
}

let imageIndex = 1;
changePic(imageIndex);
function currentImage(n) {
  changePic((imageIndex = n));
}
function changePic(n) {
  let i;
  let image = document.getElementsByClassName("pics");
  let belowPic = document.getElementsByClassName("first");
  if (n > image.length) {
    imageIndex = 1;
  }
  if (n < 1) {
    imageIndex = image.length;
  }
  for (i = 0; i < image.length; i++) {
    image[i].style.display = "none";
  }
  for (i = 0; i < belowPic.length; i++) {
    belowPic[i].className = belowPic[i].className.replace(" active", "");
  }
  image[imageIndex - 1].style.display = "block";
  belowPic[imageIndex - 1].className += " active";
}

// --- Nav highlight functions ---
function colorNone() {
  document.getElementById("hover").style.borderBottom = "0px";
}
function colorNonea() {
  document.getElementById("hovera").style.borderBottom = "0px";
}
function colorNone1() {
  document.getElementById("hoverb").style.borderBottom = "0px";
}
function colorNone2() {
  document.getElementById("hoverc").style.borderBottom = "0px";
}
function colorNone3() {
  document.getElementById("hoverd").style.borderBottom = "0px";
}

function colored() {
  let ben = document.getElementById("hoverb");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "40px";
  colorNonea();
  colorNone();
  colorNone2();
  colorNone3();
  localStorage.setItem("theme", "women");
}
function colora() {
  let ben = document.getElementById("hoverc");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "40px";
  colorNonea();
  colorNone1();
  colorNone();
  colorNone3();
  localStorage.setItem("theme", "about");
}
function colorb() {
  let ben = document.getElementById("hoverd");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "40px";
  colorNonea();
  colorNone1();
  colorNone2();
  colorNone();
  localStorage.setItem("theme", "contact");
}
function color() {
  let ben = document.getElementById("hover");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "40px";
  colorNonea();
  colorNone1();
  colorNone2();
  colorNone3();
  localStorage.setItem("theme", "collection");
}
function colors() {
  let ben = document.getElementById("hovera");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "40px";
  colorNone();
  colorNone1();
  colorNone2();
  colorNone3();
  localStorage.setItem("theme", "men");
}

// --- Sub-nav highlight functions ---
function noCollect() {
  document.getElementById("collect").style.borderBottom = "0px";
}
function noMale() {
  document.getElementById("male").style.borderBottom = "0px";
}
function noFemale() {
  document.getElementById("female").style.borderBottom = "0px";
}
function noStory() {
  document.getElementById("story").style.borderBottom = "0px";
}
function noPhone() {
  document.getElementById("phone").style.borderBottom = "0px";
}

function collect() {
  let ben = document.getElementById("collect");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "10px";
  noFemale();
  noMale();
  noPhone();
  noStory();
  localStorage.setItem("condition", "collect");
}
function men() {
  let ben = document.getElementById("male");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "10px";
  noCollect();
  noFemale();
  noPhone();
  noStory();
  localStorage.setItem("condition", "male");
}
function women() {
  let ben = document.getElementById("female");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "10px";
  noCollect();
  noMale();
  noPhone();
  noStory();
  localStorage.setItem("condition", "female");
}
function story() {
  let ben = document.getElementById("story");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "10px";
  noCollect();
  noMale();
  noFemale();
  noPhone();
  localStorage.setItem("condition", "story");
}
function phone() {
  let ben = document.getElementById("phone");
  ben.style.borderBottom = "3px solid hsl(26, 100%, 55%)";
  ben.style.paddingBottom = "10px";
  noCollect();
  noMale();
  noFemale();
  noStory();
  localStorage.setItem("condition", "phone");
}

//  Single merged window.onload — restores both theme & condition
// Cart count is loaded in the module script via onAuthStateChanged
window.onload = () => {
  // Restore nav theme
  const theme = localStorage.getItem("theme");
  if (theme === "men") colors();
  if (theme === "collection") color();
  if (theme === "contact") colorb();
  if (theme === "about") colora();
  if (theme === "women") colored();

  // Restore sub-nav condition
  const condition = localStorage.getItem("condition");
  if (condition === "collect") collect();
  if (condition === "male") men();
  if (condition === "female") women();
  if (condition === "story") story();
  if (condition === "phone") phone();
};

let slideIndex = 1;
nextPic(slideIndex);
function plusSlides(n) {
  nextPic((slideIndex += n));
}
function currentSlide(n) {
  nextPic((slideIndex = n));
}
function nextPic(n) {
  let i;
  let image = document.getElementsByClassName("lightboxpic");
  let belowPic = document.getElementsByClassName("lightboxFirst");
  if (n > image.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = image.length;
  }
  for (i = 0; i < image.length; i++) {
    image[i].style.display = "none";
  }
  for (i = 0; i < belowPic.length; i++) {
    belowPic[i].className = belowPic[i].className.replace(" on", "");
  }
  image[slideIndex - 1].style.display = "block";
  belowPic[slideIndex - 1].className += " on";
}

let lightbox = document.getElementById("bgt");
function displayLightbox() {
  lightbox.style.display = "initial";
}
function cancel() {
  lightbox.style.display = "none";
}

let cartContent = document.getElementById("cart");
let cart1 = document.getElementById("cart1");
let cart2 = document.getElementById("cart2");
function openCart() {
  cartContent.style.display = "initial";
  cart1.style.display = "none";
  cart2.style.display = "initial";
}
function closeCart() {
  cartContent.style.display = "none";
  cart2.style.display = "none";
  cart1.style.display = "initial";
}

function addToCart() {
  let number = document.getElementById("numbre");
  let message = document.getElementById("message");
  let qty = document.getElementById("zero");
  let add = qty.innerHTML;
  let whole = document.getElementById("whole");
  let cartItem = document.getElementById("cartNo");

  number.innerHTML = add;
  cartItem.innerHTML = add;
  message.style.display = "initial";
  message.style.animation = "slideIn 2s ease forwards";

  whole.innerHTML = add <= "1" ? " item " : " items ";

  setTimeout(() => {
    message.style.animation = "slideOut 2s ease forwards";
  }, 5000);

  let orderValue = document.getElementById("order");
  let result = document.getElementById("added");
  let empty = document.getElementById("emptyCart");
  let filled = document.getElementById("active");

  if (add != 0) {
    orderValue.innerHTML = add;
    empty.style.display = "none";
    filled.style.display = "initial";
  }
  if (add === "0") {
    orderValue.innerHTML = add;
    empty.style.display = "flex";
    filled.style.display = "none";
  }

  let total = 125 * add;
  result.innerHTML = "$" + total;

  //  Save cart count per user — auth is handled in the module script
  // window.saveCartCount is set by the module script once auth is ready
  if (typeof window.saveCartCount === "function") {
    window.saveCartCount(add);
  }
}

function Clear() {
  let qty = document.getElementById("zero");
  let cartItem = document.getElementById("cartNo");
  let message = document.getElementById("message");
  cartItem.innerHTML = "0";
  qty.innerHTML = "0";
  message.style.display = "none";
  document.getElementById("emptyCart").style.display = "flex";
  document.getElementById("active").style.display = "none";

  if (typeof window.saveCartCount === "function") {
    window.saveCartCount("0");
  }
}

function success() {
  let qty = document.getElementById("zero");
  let cartItem = document.getElementById("cartNo");
  let confirmed = document.getElementById("success");
  let number = document.getElementById("numbre");
  let empty = document.getElementById("emptyCart");
  let filled = document.getElementById("active");

  confirmed.style.display = "initial";
  confirmed.style.animation = "slide 1s ease forwards";
  cartItem.innerHTML = "0";
  qty.innerHTML = "0";
  number.innerHTML = "0";
  empty.style.display = "flex";
  filled.style.display = "none";

  setTimeout(() => {
    confirmed.style.animation = "return 1s ease forwards";
  }, 5000);

  if (typeof window.saveCartCount === "function") {
    window.saveCartCount("0");
  }
}

function openMenu() {
  let menu = document.getElementById("menu");
  let menubg = document.getElementById("bgm");
  menu.style.display = "flex";
  menubg.style.display = "flex";
  menu.style.animation = "draw 2s ease";
}
function closeMenu() {
  let menu = document.getElementById("menu");
  let menubg = document.getElementById("bgm");
  menubg.style.display = "none";
  menu.style.animation = "drawout 2s ease forwards";
}
