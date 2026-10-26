(function(){
"use strict";
const DESKTOP_QUERY="(min-width: 1201px)";
const CLOSE_ANIMATION_MS=220;
const WHEEL_COOLDOWN_MS=340;
const desktopQuery=window.matchMedia(DESKTOP_QUERY);
let overlay=null;
let overlayImage=null;
let closeButton=null;
let lastFocused=null;
let closeTimer=null;
let wheelTimer=null;
let panelObserver=null;
let galleryItems=[];
let currentIndex=-1;
let wheelLocked=false;
let initialized=false;
let isOpen=false;
function isDesktop(){
return desktopQuery.matches;
}
function prefersReducedMotion(){
return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function subscribe(query,handler){
if(typeof query.addEventListener==="function"){
query.addEventListener("change",handler);
return;
}
query.addListener(handler);
}
function getImageItem(target){
if(!(target instanceof Element)){
return null;
}
return target.closest(".gallery-item[data-type='image']");
}
function collectGalleryItems(item){
const panel=item.closest(".gallery-panel");
if(!panel){
return[item];
}
return Array.from(
panel.querySelectorAll(".gallery-item[data-type='image']")
).filter((candidate)=>{
return candidate.querySelector("img.gallery-image");
});
}
function getImageSource(item){
const image=item?item.querySelector("img.gallery-image"):null;
return image?image.currentSrc||image.src:"";
}
function preloadItem(item){
const source=getImageSource(item);
if(!source){
return;
}
const image=document.createElement("img");
image.decoding="async";
image.src=source;
}
function preloadNeighbors(){
preloadItem(galleryItems[currentIndex-1]);
preloadItem(galleryItems[currentIndex+1]);
}
function showIndex(index){
const item=galleryItems[index];
const source=getImageSource(item);
if(!item||!source){
return false;
}
const thumbnail=item.querySelector("img.gallery-image");
currentIndex=index;
overlayImage.src=source;
overlayImage.alt=thumbnail.alt||"";
lastFocused=item;
preloadNeighbors();
return true;
}
function step(direction){
if(!isOpen||!galleryItems.length){
return false;
}
return showIndex(currentIndex+direction);
}
function enhanceImageItem(item){
if(!item||!item.matches(".gallery-item[data-type='image']")){
return;
}
if(!isDesktop()){
item.removeAttribute("tabindex");
item.removeAttribute("role");
item.removeAttribute("aria-label");
item.removeAttribute("aria-haspopup");
return;
}
const image=item.querySelector("img.gallery-image");
const alt=image?image.alt:"";
item.tabIndex=0;
item.setAttribute("role","button");
item.setAttribute("aria-haspopup","dialog");
item.setAttribute(
"aria-label",
alt?"Открыть изображение: "+alt:"Открыть изображение"
);
}
function syncImageItems(){
const panelBody=document.getElementById("panel-body");
if(!panelBody){
return;
}
panelBody
.querySelectorAll(".gallery-item[data-type='image']")
.forEach(enhanceImageItem);
}
function createCloseIcon(){
const source=document.querySelector(
"#panel-close .panel-close-icon"
);
if(!source){
closeButton.textContent="×";
return;
}
const icon=source.cloneNode(true);
icon.classList.add("gallery-lightbox-close-icon");
closeButton.appendChild(icon);
}
function createOverlay(){
overlay=document.createElement("div");
overlay.className="gallery-lightbox";
overlay.hidden=true;
overlay.setAttribute("role","dialog");
overlay.setAttribute("aria-modal","true");
overlay.setAttribute("aria-label","Просмотр изображения");
closeButton=document.createElement("button");
closeButton.className="gallery-lightbox-close";
closeButton.type="button";
closeButton.setAttribute("aria-label","Закрыть изображение");
createCloseIcon();
overlayImage=document.createElement("img");
overlayImage.className="gallery-lightbox-image";
overlayImage.alt="";
overlayImage.draggable=false;
overlay.appendChild(closeButton);
overlay.appendChild(overlayImage);
document.body.appendChild(overlay);
}
function clearCloseTimer(){
if(closeTimer===null){
return;
}
window.clearTimeout(closeTimer);
closeTimer=null;
}
function clearWheelTimer(){
if(wheelTimer!==null){
window.clearTimeout(wheelTimer);
wheelTimer=null;
}
wheelLocked=false;
}
function handleWheel(event){
if(!isOpen){
return;
}
if(event.ctrlKey||event.altKey||event.metaKey){
return;
}
event.preventDefault();
if(wheelLocked||event.deltaY===0){
return;
}
if(!step(event.deltaY>0?1:-1)){
return;
}
wheelLocked=true;
wheelTimer=window.setTimeout(()=>{
wheelLocked=false;
wheelTimer=null;
},WHEEL_COOLDOWN_MS);
}
function finishClose(focusTarget){
if(isOpen||!overlay){
return;
}
overlay.hidden=true;
overlayImage.removeAttribute("src");
overlayImage.alt="";
if(focusTarget&&focusTarget.isConnected){
focusTarget.focus({preventScroll:true});
}
galleryItems=[];
currentIndex=-1;
lastFocused=null;
closeTimer=null;
}
function close(options={}){
if(!isOpen){
return;
}
const focusTarget=
options.restoreFocus===false?null:lastFocused;
isOpen=false;
overlay.classList.remove("is-open");
document.body.classList.remove("is-lightbox-open");
clearCloseTimer();
clearWheelTimer();
if(prefersReducedMotion()){
finishClose(focusTarget);
return;
}
closeTimer=window.setTimeout(()=>{
finishClose(focusTarget);
},CLOSE_ANIMATION_MS);
}
function openImage(item){
if(!isDesktop()||isOpen||!overlay){
return;
}
const thumbnail=item.querySelector("img.gallery-image");
if(
!thumbnail||
!thumbnail.complete||
thumbnail.naturalWidth<=0
){
return;
}
const items=collectGalleryItems(item);
const index=items.indexOf(item);
galleryItems=index===-1?[item]:items;
currentIndex=index===-1?0:index;
clearCloseTimer();
clearWheelTimer();
if(!showIndex(currentIndex)){
galleryItems=[];
currentIndex=-1;
return;
}
overlay.hidden=false;
document.body.classList.add("is-lightbox-open");
isOpen=true;
window.requestAnimationFrame(()=>{
if(isOpen){
overlay.classList.add("is-open");
}
});
closeButton.focus({preventScroll:true});
}
function handleDocumentClick(event){
if(isOpen){
if(
event.target===overlay||
event.target===overlayImage||
(event.target instanceof Element&&
event.target.closest(".gallery-lightbox-close"))
){
close();
}
return;
}
if(!isDesktop()){
return;
}
const item=getImageItem(event.target);
if(item){
openImage(item);
}
}
function handleDocumentKeydown(event){
if(isOpen){
if(event.key==="Escape"){
event.preventDefault();
event.stopImmediatePropagation();
close();
return;
}
if(!event.altKey&&!event.ctrlKey&&!event.metaKey){
if(
event.key==="ArrowRight"||
event.key==="ArrowDown"
){
event.preventDefault();
event.stopImmediatePropagation();
step(1);
return;
}
if(event.key==="ArrowLeft"||event.key==="ArrowUp"){
event.preventDefault();
event.stopImmediatePropagation();
step(-1);
return;
}
}
if(event.key==="Tab"){
event.preventDefault();
closeButton.focus({preventScroll:true});
}
return;
}
if(!isDesktop()){
return;
}
if(event.key!=="Enter"&&event.key!==" "){
return;
}
const item=getImageItem(event.target);
if(!item){
return;
}
event.preventDefault();
openImage(item);
}
function handleDesktopChange(event){
syncImageItems();
if(!event.matches&&isOpen){
close();
}
}
function handlePanelChange(){
if(isOpen){
close({restoreFocus:false});
}
}
function observePanel(){
const panel=document.getElementById("content-panel");
if(!panel||typeof window.MutationObserver!=="function"){
return;
}
panelObserver=new window.MutationObserver(()=>{
if(panel.hidden&&isOpen){
close({restoreFocus:false});
}
});
panelObserver.observe(panel,{
attributes:true,
attributeFilter:["hidden"]
});
}
function init(){
if(initialized||!document.body){
return;
}
initialized=true;
createOverlay();
overlay.addEventListener("wheel",handleWheel,{passive:false});
document.addEventListener("click",handleDocumentClick);
document.addEventListener("keydown",handleDocumentKeydown,true);
window.addEventListener("hashchange",handlePanelChange);
window.addEventListener("popstate",handlePanelChange);
subscribe(desktopQuery,handleDesktopChange);
observePanel();
syncImageItems();
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.galleryLightbox={
enhanceImageItem,
init
};
})();