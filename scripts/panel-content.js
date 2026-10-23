(function(){
"use strict";
let renderToken=0;
function clear(){
renderToken+=1;
if(window.Yevwke.panelGallery){
window.Yevwke.panelGallery.clear();
}
const body=document.getElementById("panel-body");
if(body){
body.removeAttribute("aria-busy");
}
}
function renderContent(project,content,body){
if(project.type==="text"){
window.Yevwke.panelText.render(project,content,body);
return;
}
if(project.type==="gallery"){
window.Yevwke.panelGallery.render(project,content,body);
}
}
function render(project,body){
clear();
body.replaceChildren();
if(!project){
return;
}
const content=window.Yevwke.data.getPanel(project.id);
if(content){
renderContent(project,content,body);
return;
}
const token=renderToken;
body.setAttribute("aria-busy","true");
window.Yevwke.data.loadPanel(project).then((loaded)=>{
if(token!==renderToken){
return;
}
body.removeAttribute("aria-busy");
body.replaceChildren();
renderContent(project,loaded||{},body);
});
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.panelContent={render,clear};
})();