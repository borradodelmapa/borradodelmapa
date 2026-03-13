/* APP.JS LIMPIO
Arquitectura simple y sin duplicados
- 1 sola inicialización de Firebase
- Login / Register / Google
- Guardar rutas users/{uid}/maps
- Dashboard rutas
*/

const firebaseConfig = {
  apiKey: "AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA",
  authDomain: "borradodelmapa-85257.firebaseapp.com",
  projectId: "borradodelmapa-85257",
  storageBucket: "borradodelmapa-85257.firebasestorage.app",
  messagingSenderId: "833042338746",
  appId: "1:833042338746:web:32b58e582488c6064d8383",
  measurementId: "G-JZ00MFJEHB"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;

function $(id){return document.getElementById(id);}

window.showToast=function(msg){
  const t=$("toast");
  if(!t)return;
  t.innerText=msg;
  t.style.display="block";
  setTimeout(()=>t.style.display="none",3000);
}

window.openModal=function(view){
  const m=$("modal-auth");
  if(!m)return;
  m.style.display="flex";
  switchModal(view||"login");
}

window.closeModal=function(){
  const m=$("modal-auth");
  if(m)m.style.display="none";
}

window.switchModal=function(view){
  const login=$("modal-login-view");
  const reg=$("modal-register-view");

  if(login)login.style.display=view=="register"?"none":"block";
  if(reg)reg.style.display=view=="register"?"block":"none";
}

function navGuest(){
  if($("nav-links-guest"))$("nav-links-guest").style.display="flex";
  if($("nav-links-user"))$("nav-links-user").style.display="none";
}

function navUser(user){
  if($("nav-links-guest"))$("nav-links-guest").style.display="none";
  if($("nav-links-user"))$("nav-links-user").style.display="flex";

  if($("nav-avatar")){
    $("nav-avatar").innerText=(user.name||"U").charAt(0);
  }
}

window.doLogin=async function(){

const email=$("login-email").value.trim();
const pass=$("login-pass").value;

if(!email||!pass){
showToast("Introduce email y contraseña");
return;
}

try{

await auth.signInWithEmailAndPassword(email,pass);

closeModal();

}catch(e){

showToast("Error login");

}

}

window.doRegister=async function(){

const name=$("reg-name").value.trim();
const email=$("reg-email").value.trim();
const pass=$("reg-pass").value;

if(!name||!email||!pass){
showToast("Completa todos los campos");
return;
}

try{

const cred=await auth.createUserWithEmailAndPassword(email,pass);

await db.collection("users").doc(cred.user.uid).set({

name:name,
email:email,
isPremium:false,
createdAt:firebase.firestore.FieldValue.serverTimestamp()

});

await cred.user.updateProfile({displayName:name});

closeModal();

}catch(e){

showToast("Error registro");

}

}

window.doSocialLogin=async function(){

try{

const result=await auth.signInWithPopup(googleProvider);

const user=result.user;

const ref=db.collection("users").doc(user.uid);

const snap=await ref.get();

if(!snap.exists){

await ref.set({

name:user.displayName||"Viajero",
email:user.email,
createdAt:firebase.firestore.FieldValue.serverTimestamp()

});

}

closeModal();

}catch(e){

console.error(e);

showToast("Error Google login");

}

}

window.logout=function(){

firebase.auth().signOut();

showPage("home");

}

auth.onAuthStateChanged(async(user)=>{

if(!user){

currentUser=null;
navGuest();
return;

}

const doc=await db.collection("users").doc(user.uid).get();

const data=doc.data()||{};

currentUser={

uid:user.uid,
name:data.name||user.displayName,
email:user.email

}

navUser(currentUser);

loadUserMaps();

});

window.saveRoute=async function(route){

if(!currentUser){

openModal("register");

return;

}

try{

await db
.collection("users")
.doc(currentUser.uid)
.collection("maps")
.add(route);

showToast("Ruta guardada");

loadUserMaps();

}catch(e){

console.error(e);

showToast("Error guardando ruta");

}

}

window.loadUserMaps=async function(){

if(!currentUser)return;

const snap=await db
.collection("users")
.doc(currentUser.uid)
.collection("maps")
.get();

const grid=$("maps-grid-dynamic");

if(!grid)return;

let html="";

snap.forEach(doc=>{

const m=doc.data();

html+=`

<div class="map-card">
<div class="map-card-body">
<div class="map-card-title">${m.nombre||"Ruta"}</div>
<div class="map-card-meta">${m.dias||0} días</div>
</div>
</div>

`;

});

if(!html){
html="<div style='padding:40px;text-align:center'>Aún no tienes rutas</div>";
}

grid.innerHTML=html;

}

window.toggleUserMenu=function(){

const m=$("user-menu");

if(!m)return;

m.style.display=m.style.display=="block"?"none":"block";

}

window.showPage=function(name){

const pages=document.querySelectorAll(".page");

pages.forEach(p=>{

p.style.display="none";

});

const target=$("page-"+name);

if(target){

target.style.display="block";

}

}

window.addEventListener("load",()=>{

const hero=$("hero-map");

if(hero){

hero.style.backgroundImage="url('https://raw.githubusercontent.com/borradodelmapa/borradodelmapa/main/mapa.png')";
hero.style.backgroundSize="cover";
hero.style.backgroundPosition="center";

}

});