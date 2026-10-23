(function(){
"use strict";
let initialized=false;
let frame=null;
function init(){
if(initialized){
return;
}
const sidebar=document.querySelector(".sidebar");
if(!sidebar){
return;
}
initialized=true;
function getScrollTarget(){
if(window.matchMedia("(min-width: 1201px)").matches){
return sidebar;
}
return document.scrollingElement||document.documentElement;
}
function update(){
frame=null;
const target=getScrollTarget();
if(!target){
return;
}
const scrollable=target.scrollHeight>target.clientHeight+1;
sidebar.classList.toggle("is-fade-visible",scrollable);
}
function schedule(){
if(frame!==null){
return;
}
frame=window.requestAnimationFrame(update);
}
window.addEventListener("resize",schedule,{passive:true});
window.addEventListener("load",schedule);
if(document.fonts&&document.fonts.ready){
document.fonts.ready.then(schedule);
}
if("ResizeObserver"in window){
const observer=new ResizeObserver(schedule);
const projects=document.getElementById("projects-groups");
observer.observe(sidebar);
if(projects){
observer.observe(projects);
}
}
schedule();
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.sidebarFade={init};
})();