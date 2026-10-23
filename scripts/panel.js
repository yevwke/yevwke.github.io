(function(){
"use strict";
let activeLink=null;
const PANEL_ANIMATION_MS=420;
const PANEL_CLOSE_DELAY_MS=PANEL_ANIMATION_MS+40;
let panelState="closed";
let closeTimer=null;
function prefersReducedMotion(){
return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function clearCloseTimer(){
if(closeTimer!==null){
window.clearTimeout(closeTimer);
closeTimer=null;
}
}
function projectPath(id){
const root=document.body.dataset.projectsRoot||"projects";
return"/"+root+"/"+encodeURIComponent(id)+"/";
}
function homePath(){
return"/"+window.location.search;
}
function setPanelUrl(id,mode){
const url=id?projectPath(id):homePath();
try{
if(mode==="push"){
history.pushState({panel:id||null},"",url);
}else{
history.replaceState({panel:id||null},"",url);
}
}catch(error){
window.location.href=url;
}
}
function getProjectIdFromPath(){
const root=document.body.dataset.projectsRoot||"projects";
const escapedRoot=root.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const match=window.location.pathname.match(
new RegExp("^/"+escapedRoot+"/([^/]+)/?$")
);
if(!match){
return"";
}
try{
return decodeURIComponent(match[1]);
}catch(error){
return"";
}
}
function getPanelIdFromHash(){
const hash=window.location.hash.slice(1);
if(!hash){
return"";
}
try{
return decodeURIComponent(hash);
}catch(error){
return"";
}
}
function getProjectIdFromLocation(){
return getProjectIdFromPath()||getPanelIdFromHash();
}
function findPanelLink(id){
if(!id){
return null;
}
const links=document.querySelectorAll(
"#projects-groups .project-link[data-id]"
);
for(const link of links){
if(link.dataset.id===id){
return link;
}
}
return null;
}
function setLinkState(link,expanded){
if(!link){
return;
}
link.classList.toggle("is-active",expanded);
link.setAttribute("aria-expanded",expanded?"true":"false");
}
function resetPanelScroll(panel,body){
panel.scrollTop=0;
body.scrollTop=0;
}
function openPanel(link,options={}){
const panel=document.getElementById("content-panel");
const body=document.getElementById("panel-body");
if(!panel||!body){
return false;
}
const id=link.dataset.id;
const project=window.Yevwke.data.getProject(id);
if(!project){
return false;
}
const updateHistory=options.updateHistory!==false;
const moveFocus=options.moveFocus!==false;
const wasHidden=panel.hidden;
const reducedMotion=prefersReducedMotion();
const title=link.querySelector(".project-title");
clearCloseTimer();
panel.classList.remove("is-leaving");
panelState="opening";
if(activeLink&&activeLink!==link){
setLinkState(activeLink,false);
}
body.className="panel-body panel-body--"+project.type;
window.Yevwke.panelContent.render(project,body);
panel.setAttribute("aria-label",title?title.textContent:"Содержимое");
panel.hidden=false;
resetPanelScroll(panel,body);
document.body.classList.add("is-panel-open");
document.body.classList.add("is-sidebar-dimmed");
activeLink=link;
setLinkState(activeLink,true);
const currentItems=document.querySelectorAll(".project-item.is-current");
currentItems.forEach((item)=>{
item.classList.remove("is-current");
});
const activeItem=activeLink.closest(".project-item");
if(activeItem){
activeItem.classList.add("is-current");
}
if(updateHistory&&id){
setPanelUrl(id,wasHidden?"push":"replace");
}
if(wasHidden){
panel.classList.remove("is-open");
if(reducedMotion){
panel.classList.add("is-open");
panelState="open";
}else{
void panel.offsetHeight;
requestAnimationFrame(()=>{
if(panel.hidden||panelState!=="opening"){
return;
}
panel.classList.add("is-open");
panelState="open";
});
}
}else{
panel.classList.add("is-open");
panelState="open";
}
if(!wasHidden||!moveFocus){
return true;
}
const closeButton=document.getElementById("panel-close");
if(window.matchMedia("(max-width: 1200px)").matches&&closeButton){
closeButton.focus();
}else{
panel.focus();
}
return true;
}
function closePanel(returnFocus,options={}){
const panel=document.getElementById("content-panel");
const body=document.getElementById("panel-body");
if(!panel||panel.hidden||panelState==="closing"){
return;
}
const updateHistory=options.updateHistory!==false;
const reducedMotion=prefersReducedMotion();
const wasOpen=panel.classList.contains("is-open");
clearCloseTimer();
panelState="closing";
panel.classList.remove("is-open");
panel.classList.add("is-leaving");
document.body.classList.remove("is-sidebar-dimmed");
let closingItem=null;
if(activeLink){
const link=activeLink;
closingItem=link.closest(".project-item");
setLinkState(link,false);
activeLink=null;
if(returnFocus){
link.focus();
}
}
if(updateHistory){
setPanelUrl("","replace");
}
const finish=()=>{
if(panelState!=="closing"){
return;
}
panel.hidden=true;
panel.classList.remove("is-leaving");
panel.removeAttribute("aria-label");
if(closingItem){
closingItem.classList.remove("is-current");
}
document.body.classList.remove("is-panel-open");
if(window.Yevwke.panelContent){
window.Yevwke.panelContent.clear();
}
if(body){
body.className="panel-body";
body.replaceChildren();
}
panelState="closed";
closeTimer=null;
};
if(reducedMotion||!wasOpen){
finish();
return;
}
closeTimer=window.setTimeout(finish,PANEL_CLOSE_DELAY_MS);
}
function handleProjectsClick(event){
if(
event.defaultPrevented||
event.button!==0||
event.metaKey||
event.ctrlKey||
event.shiftKey||
event.altKey||
!(event.target instanceof Element)
){
return;
}
const link=event.target.closest("a.project-link[data-id]");
if(!link){
return;
}
if(!window.Yevwke.data.getProject(link.dataset.id)){
return;
}
event.preventDefault();
if(link===activeLink){
closePanel(true);
}else{
openPanel(link);
}
}
function syncPanelFromLocation(options={}){
const id=getProjectIdFromLocation();
const link=findPanelLink(id);
if(link){
if(link!==activeLink){
openPanel(link,{updateHistory:false,moveFocus:false});
}
if(
options.replaceLegacyHash&&
getPanelIdFromHash()&&
!getProjectIdFromPath()
){
const replaceLegacyHash=()=>{
if(!getProjectIdFromPath()){
setPanelUrl(id,"replace");
}
};
if(document.readyState==="complete"){
window.setTimeout(replaceLegacyHash,0);
}else{
window.addEventListener("load",replaceLegacyHash,{
once:true
});
}
}
return;
}
if(activeLink){
closePanel(false,{updateHistory:false});
}
}
function initLogoLink(){
const logo=document.querySelector(".logo");
if(!logo){
return;
}
logo.addEventListener("click",(event)=>{
if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey){
return;
}
event.preventDefault();
if(activeLink){
closePanel(false);
}else if(window.location.pathname!=="/"||window.location.hash){
setPanelUrl("","replace");
}
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
window.scrollTo({
top:0,
behavior:reducedMotion?"auto":"smooth"
});
});
}
function initLinks(){
const links=document.querySelectorAll(
"#projects-groups .project-link[data-id]"
);
links.forEach((link)=>{
link.setAttribute("aria-controls","content-panel");
link.setAttribute("aria-expanded","false");
});
}
function init(){
const panel=document.getElementById("content-panel");
const closeButton=document.getElementById("panel-close");
if(!panel||!closeButton){
return;
}
const projectsContainer=document.getElementById("projects-groups");
if(projectsContainer){
projectsContainer.addEventListener("click",handleProjectsClick);
}
closeButton.addEventListener("click",()=>{
closePanel(true);
});
document.addEventListener("keydown",(event)=>{
if(event.key==="Escape"&&!panel.hidden){
closePanel(true);
}
});
window.addEventListener("popstate",()=>{
syncPanelFromLocation();
});
window.addEventListener("hashchange",()=>{
syncPanelFromLocation({replaceLegacyHash:true});
});
initLinks();
initLogoLink();
syncPanelFromLocation({replaceLegacyHash:true});
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.panel={init};
})();