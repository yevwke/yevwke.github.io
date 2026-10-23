(function(){
"use strict";
function safeHref(value){
const url=String(value||"");
if(/^(?:javascript|data|vbscript):/i.test(url)||url.startsWith("//")){
return"";
}
return url;
}
function projectPath(id){
const root=document.body.dataset.projectsRoot||"projects";
return"/"+root+"/"+encodeURIComponent(id)+"/";
}
function createProjectElement(project){
const type=project.type==="gallery"||project.type==="text"
?project.type
:"link";
const item=document.createElement("li");
item.className="project-item";
let control;
if(type==="link"){
const link=document.createElement("a");
link.className="project-link";
link.href=safeHref(project.url);
if(project.newTab!==false){
link.target="_blank";
link.rel="noopener noreferrer";
}
control=link;
}else{
const link=document.createElement("a");
link.className="project-link";
link.href=projectPath(project.id||"");
link.dataset.type=type;
link.dataset.id=project.id||"";
link.setAttribute("aria-controls","content-panel");
control=link;
}
const text=document.createElement("span");
text.className="project-text";
const title=document.createElement("span");
title.className="project-title";
title.textContent=project.title||"";
text.appendChild(title);
if(project.description){
const description=document.createElement("span");
description.className="project-description";
description.textContent=project.description;
text.appendChild(description);
}
control.appendChild(text);
item.appendChild(control);
return item;
}
function createProjectGroup(section,index){
const group=document.createElement("div");
group.className="project-group";
if(section.title){
const heading=document.createElement(index===0?"h1":"h2");
heading.className="project-group-title";
heading.textContent=section.title;
group.appendChild(heading);
}
const list=document.createElement("ul");
list.className="projects-list";
const projects=Array.isArray(section.projects)?section.projects:[];
projects.forEach((project)=>{
if(project){
list.appendChild(createProjectElement(project));
}
});
group.appendChild(list);
return group;
}
function render(catalog){
const container=document.getElementById("projects-groups");
if(!container){
return;
}
container.innerHTML="";
(catalog.sections||[]).forEach((section,index)=>{
container.appendChild(createProjectGroup(section,index));
});
}
function renderError(message){
const container=document.getElementById("projects-groups");
if(!container){
return;
}
container.innerHTML="";
const error=document.createElement("p");
error.className="project-description";
error.textContent=message;
container.appendChild(error);
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.projects={
render,
renderError
};
})();