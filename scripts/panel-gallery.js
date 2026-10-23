(function(){
"use strict";
const MAX_ROW_ITEMS=4;
const DEFAULT_ROW_ITEMS=4;
const MOBILE_QUERY="(max-width: 600px)";
const NARROW_QUERY="(max-width: 1440px)";
const PANEL_SCROLL_QUERY="(max-width: 1200px)";
const REVEAL_THRESHOLD=0.01;
let state=null;
let listenersBound=false;
function prefersReducedMotion(){
return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getMode(){
if(window.matchMedia(MOBILE_QUERY).matches){
return"mobile";
}
if(window.matchMedia(NARROW_QUERY).matches){
return"narrow";
}
return"wide";
}
function normalizeRowItems(value){
const count=Number(value);
if(!Number.isFinite(count)||count<1){
return DEFAULT_ROW_ITEMS;
}
return Math.min(MAX_ROW_ITEMS,Math.floor(count));
}
function getRowItems(base,mode){
if(mode==="mobile"){
return 1;
}
if(mode==="narrow"){
return Math.max(1,base-1);
}
return base;
}
function buildRows(items,rowSizes,mode){
const rows=[];
let itemIndex=0;
let rowIndex=0;
while(itemIndex<items.length){
const base=normalizeRowItems(rowSizes[rowIndex]);
const count=getRowItems(base,mode);
rows.push(items.slice(itemIndex,itemIndex+count));
itemIndex+=count;
rowIndex+=1;
}
return rows;
}
function isLocalSource(src){
return(
typeof src==="string"&&
src.length>0&&
!/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(src)
);
}
function resolveAsset(src){
if(window.Yevwke.data&&window.Yevwke.data.resolveAsset){
return window.Yevwke.data.resolveAsset(src);
}
return src;
}
function hasImageRatio(item){
const width=Number(item.width);
const height=Number(item.height);
if(
Number.isFinite(width)&&
width>0&&
Number.isFinite(height)&&
height>0
){
return true;
}
return item.ratio!==undefined&&item.ratio!==null;
}
function getImageRatio(item){
const width=Number(item.width);
const height=Number(item.height);
if(
Number.isFinite(width)&&
width>0&&
Number.isFinite(height)&&
height>0
){
return width/height;
}
return normalizeRatio(item.ratio);
}
function normalizeRatio(value){
if(typeof value==="string"&&/[:/]/.test(value)){
const parts=value.split(/[:/]/);
if(parts.length===2){
const width=Number(parts[0].trim().replace(",","."));
const height=Number(parts[1].trim().replace(",","."));
if(
Number.isFinite(width)&&
Number.isFinite(height)&&
width>0&&
height>0
){
return width/height;
}
}
return 1;
}
const ratio=Number(
typeof value==="string"?value.trim().replace(",","."):value
);
return Number.isFinite(ratio)&&ratio>0?ratio:1;
}
function disconnectObserver(){
if(!state||!state.observer){
return;
}
state.observer.disconnect();
state.observer=null;
}
function revealItem(item){
item.classList.add("is-revealed");
}
function revealAll(){
if(!state||!state.panel){
return;
}
state.panel.querySelectorAll(".gallery-item").forEach(revealItem);
}
function markReady(item){
item.classList.add("is-ready");
const row=item.closest(".gallery-row");
if(row&&row.classList.contains("is-in-view")){
revealItem(item);
}
}
function revealRow(row){
row.classList.add("is-in-view");
row.querySelectorAll(".gallery-item").forEach((item)=>{
if(item.classList.contains("is-ready")){
revealItem(item);
}
});
}
function getRevealRoot(){
if(window.matchMedia(PANEL_SCROLL_QUERY).matches){
return document.getElementById("content-panel");
}
return state?state.body:null;
}
function setupObserver(){
if(!state||!state.panel||!state.panel.isConnected){
return;
}
disconnectObserver();
if(
prefersReducedMotion()||
typeof window.IntersectionObserver!=="function"
){
revealAll();
return;
}
const observer=new IntersectionObserver(
(entries)=>{
entries.forEach((entry)=>{
if(!entry.isIntersecting){
return;
}
revealRow(entry.target);
observer.unobserve(entry.target);
});
},
{
root:getRevealRoot(),
threshold:REVEAL_THRESHOLD
}
);
state.observer=observer;
state.panel.querySelectorAll(".gallery-row").forEach((row)=>{
if(row.querySelector(".gallery-item:not(.is-revealed)")){
observer.observe(row);
}
});
}
function scheduleObserver(){
if(!state){
return;
}
const currentState=state;
window.requestAnimationFrame(()=>{
window.requestAnimationFrame(()=>{
if(state!==currentState){
return;
}
setupObserver();
});
});
}
function applyRowRatios(row){
const items=Array.from(row.children);
const ratios=items.map((item)=>{
const ratio=Number(item.dataset.ratio);
return Number.isFinite(ratio)&&ratio>0?ratio:1;
});
const total=ratios.reduce((sum,ratio)=>sum+ratio,0);
if(total<=0){
return;
}
items.forEach((item,index)=>{
item.style.flexGrow=String(ratios[index]/total);
});
}
function measureTextContentHeight(content,width){
content.style.width=`${width}px`;
return Math.max(content.offsetHeight,content.scrollHeight);
}
function fitTextBlock(block){
const content=block.firstElementChild;
if(!content){
return;
}
content.style.width="";
content.style.transform="";
const style=window.getComputedStyle(block);
const availableWidth=
block.clientWidth-
parseFloat(style.paddingLeft)-
parseFloat(style.paddingRight);
const availableHeight=
block.clientHeight-
parseFloat(style.paddingTop)-
parseFloat(style.paddingBottom);
if(availableWidth<=0||availableHeight<=0){
return;
}
const fullHeight=measureTextContentHeight(content,availableWidth);
if(fullHeight<=availableHeight){
content.style.width="";
content.style.transform="";
return;
}
let low=0.01;
let high=1;
let scale=low;
for(let step=0;step<8;step+=1){
const middle=(low+high)/2;
const height=measureTextContentHeight(
content,
availableWidth/middle
);
if(middle*height<=availableHeight){
low=middle;
scale=middle;
}else{
high=middle;
}
}
content.style.width=`${availableWidth / scale}px`;
content.style.transform=scale<1?`scale(${scale})`:"";
}
function fitAllTextBlocks(){
if(!state||!state.panel){
return;
}
state.panel.querySelectorAll(".gallery-text").forEach(fitTextBlock);
}
function disconnectTextObserver(){
if(!state||!state.textObserver){
return;
}
state.textObserver.disconnect();
state.textObserver=null;
}
function clear(){
if(!state){
return;
}
disconnectTextObserver();
disconnectObserver();
state=null;
}
function setupTextFitting(){
if(!state||!state.panel){
return;
}
disconnectTextObserver();
if(typeof window.ResizeObserver!=="function"){
fitAllTextBlocks();
return;
}
const observer=new window.ResizeObserver((entries)=>{
const blocks=new Set();
entries.forEach((entry)=>{
const block=entry.target.closest(".gallery-text");
if(block&&block.isConnected){
blocks.add(block);
}
});
blocks.forEach(fitTextBlock);
});
state.textObserver=observer;
state.panel.querySelectorAll(".gallery-text").forEach((block)=>{
observer.observe(block);
});
fitAllTextBlocks();
}
function applyRatio(item,image){
if(image.naturalWidth>0&&image.naturalHeight>0){
item.dataset.ratio=String(
image.naturalWidth/image.naturalHeight
);
const row=item.parentElement;
if(row&&row.classList.contains("gallery-row")){
applyRowRatios(row);
}
}
}
function handleImageReady(item,image){
if(item.dataset.hasRatio!=="true"){
applyRatio(item,image);
}
markReady(item);
}
function createImageItem(item,isPrimary){
if(!isLocalSource(item.src)){
return null;
}
const knownRatio=hasImageRatio(item);
const ratio=getImageRatio(item);
const width=Number(item.width);
const height=Number(item.height);
const hasDimensions=
Number.isFinite(width)&&
width>0&&
Number.isFinite(height)&&
height>0;
const figure=document.createElement("figure");
figure.className="gallery-item";
figure.dataset.type="image";
figure.dataset.ratio=String(ratio);
figure.dataset.hasRatio=knownRatio?"true":"false";
const image=document.createElement("img");
image.className="gallery-image";
image.alt=item.alt||"";
image.loading=isPrimary?"eager":"lazy";
image.decoding="async";
image.setAttribute("fetchpriority",isPrimary?"high":"low");
if(hasDimensions){
image.width=width;
image.height=height;
}
figure.appendChild(image);
image.addEventListener(
"load",
()=>handleImageReady(figure,image),
{once:true}
);
image.addEventListener(
"error",
()=>markReady(figure),
{once:true}
);
image.src=resolveAsset(item.src);
if(image.complete){
if(image.naturalWidth>0&&image.naturalHeight>0){
handleImageReady(figure,image);
}else{
markReady(figure);
}
}
if(window.Yevwke.galleryLightbox){
window.Yevwke.galleryLightbox.enhanceImageItem(figure);
}
return figure;
}
function createTextItem(item){
const ratio=normalizeRatio(item.ratio);
const figure=document.createElement("article");
figure.className="gallery-item gallery-item--text";
figure.dataset.type="text";
figure.dataset.ratio=String(ratio);
figure.style.aspectRatio=String(ratio);
const block=document.createElement("div");
block.className="gallery-text";
const content=document.createElement("div");
content.className="gallery-text-content";
if(item.heading){
const heading=document.createElement("h2");
heading.className="gallery-text-title";
heading.textContent=item.heading;
content.appendChild(heading);
}
if(item.text){
content.appendChild(
window.Yevwke.panelShared.createParagraphs(
item.text,
"gallery-text-description"
)
);
}
const actions=window.Yevwke.panelShared.createActionLinks(
item.links,
"gallery-text-actions",
"gallery-text-button"
);
if(actions){
content.appendChild(actions);
}
block.appendChild(content);
figure.appendChild(block);
markReady(figure);
return figure;
}
function createItem(item,isPrimaryImage){
if(!item||typeof item!=="object"){
return null;
}
const type=item.type||"image";
if(type==="image"){
return createImageItem(item,isPrimaryImage);
}
if(type==="text"){
return createTextItem(item);
}
return null;
}
function layout(){
if(!state||!state.panel||!state.panel.isConnected){
return;
}
const mode=getMode();
if(state.mode===mode&&state.panel.childElementCount>0){
return;
}
disconnectObserver();
const rows=buildRows(state.items,state.rowSizes,mode);
const fragment=document.createDocumentFragment();
rows.forEach((items)=>{
const row=document.createElement("div");
row.className="gallery-row";
items.forEach((item)=>{
row.appendChild(item);
});
applyRowRatios(row);
fragment.appendChild(row);
});
state.panel.replaceChildren(fragment);
state.mode=mode;
setupTextFitting();
scheduleObserver();
}
function handleModeChange(){
layout();
}
function handleScrollModeChange(){
if(!state||!state.panel||!state.panel.isConnected){
return;
}
scheduleObserver();
}
function subscribe(query,handler){
if(typeof query.addEventListener==="function"){
query.addEventListener("change",handler);
return;
}
query.addListener(handler);
}
function bindModeListeners(){
if(listenersBound){
return;
}
listenersBound=true;
subscribe(window.matchMedia(MOBILE_QUERY),handleModeChange);
subscribe(window.matchMedia(NARROW_QUERY),handleModeChange);
subscribe(window.matchMedia(PANEL_SCROLL_QUERY),handleScrollModeChange);
}
function initStatic(){
if(state){
return;
}
const body=document.getElementById("panel-body");
const panel=body
?body.querySelector(".gallery-panel--static")
:null;
if(!body||!panel){
return;
}
const items=Array.from(panel.children).filter((item)=>
item.classList.contains("gallery-item")
);
if(!items.length){
return;
}
const rowSizes=String(panel.dataset.rows||"")
.split(",")
.map((value)=>Number(value))
.filter((value)=>Number.isFinite(value));
panel.classList.remove("gallery-panel--static");
panel.removeAttribute("data-rows");
state={
panel,
items,
rowSizes,
mode:null,
body,
observer:null,
textObserver:null
};
bindModeListeners();
layout();
items.forEach((item)=>{
const type=item.dataset.type||"image";
if(type!=="image"){
markReady(item);
return;
}
const image=item.querySelector("img.gallery-image");
if(!image){
markReady(item);
return;
}
if(image.complete&&image.naturalWidth>0){
markReady(item);
return;
}
image.addEventListener("load",()=>markReady(item),{
once:true
});
image.addEventListener("error",()=>markReady(item),{
once:true
});
});
}
function render(project,content,body){
clear();
const data=content||{};
const sourceItems=Array.isArray(data.items)?data.items:[];
let hasPrimaryImage=false;
const items=sourceItems
.map((item)=>{
const type=item&&(item.type||"image");
const isPrimaryImage=type==="image"&&!hasPrimaryImage;
const node=createItem(item,isPrimaryImage);
if(isPrimaryImage&&node){
hasPrimaryImage=true;
}
return node;
})
.filter((item)=>item!==null);
if(!items.length){
return;
}
const panel=document.createElement("div");
panel.className="gallery-panel";
body.appendChild(panel);
state={
panel,
items,
rowSizes:Array.isArray(data.rows)?data.rows:[],
mode:null,
body,
observer:null,
textObserver:null
};
bindModeListeners();
layout();
}
if(document.fonts&&document.fonts.ready){
document.fonts.ready.then(()=>{
fitAllTextBlocks();
});
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.panelGallery={render,initStatic,clear};
})();