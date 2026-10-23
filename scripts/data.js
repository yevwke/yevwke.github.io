(function(){
"use strict";
const jsonCache=new Map();
const panelRequests=new Map();
const projectIndex=new Map();
let catalog=null;
function resolveAsset(value){
const asset=String(value||"");
if(!asset||/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(asset)){
return asset;
}
return"/"+asset.replace(/^\.\//,"");
}
async function loadJson(path){
if(!path){
return null;
}
if(!jsonCache.has(path)){
const request=fetch(path).then((response)=>{
if(!response.ok){
throw new Error("Не удалось загрузить "+path+": "+response.status);
}
return response.json();
});
jsonCache.set(path,request);
request.catch(()=>{
if(jsonCache.get(path)===request){
jsonCache.delete(path);
}
});
}
return jsonCache.get(path);
}
async function loadCatalog(){
if(catalog){
return catalog;
}
catalog=await loadJson("/data/projects.json");
if(!catalog||!Array.isArray(catalog.sections)){
throw new Error("Некорректный формат data/projects.json");
}
projectIndex.clear();
const seen=new Set();
catalog.sections.forEach((section)=>{
const projects=Array.isArray(section.projects)?section.projects:[];
projects.forEach((project)=>{
if(!project||!project.id){
return;
}
if(seen.has(project.id)){
console.warn("Повторяющийся id проекта: "+project.id);
}
seen.add(project.id);
projectIndex.set(project.id,project);
});
});
return catalog;
}
function loadPanel(project){
const id=project&&project.id;
if(!id||!project.content){
return Promise.resolve(null);
}
const cacheKey="panel:"+id;
const cached=jsonCache.get(cacheKey);
if(cached){
return Promise.resolve(cached);
}
if(panelRequests.has(id)){
return panelRequests.get(id);
}
const request=loadJson(resolveAsset(project.content))
.then((panel)=>{
jsonCache.set(cacheKey,panel);
return panel;
})
.catch((error)=>{
console.warn("Не удалось загрузить содержимое "+id,error);
jsonCache.set(cacheKey,null);
return null;
})
.finally(()=>{
panelRequests.delete(id);
});
panelRequests.set(id,request);
return request;
}
function getProject(id){
return projectIndex.get(id)||null;
}
function getPanel(id){
return jsonCache.get("panel:"+id)||null;
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.data={
loadCatalog,
loadPanel,
getProject,
getPanel,
resolveAsset
};
})();