document.addEventListener("DOMContentLoaded",async ()=>{
const emailLink=document.getElementById("email-link");
if(emailLink&&emailLink.dataset.emailUser&&emailLink.dataset.emailDomain){
emailLink.href=
"mailto:"+
emailLink.dataset.emailUser+
"@"+
emailLink.dataset.emailDomain;
}
if(typeof initBackground==="function"){
initBackground();
}
const page=document.body.dataset.page||"home";
if(page==="project"){
const yevwke=window.Yevwke||{};
if(yevwke.galleryLightbox){
yevwke.galleryLightbox.init();
}
if(yevwke.panelGallery&&yevwke.panelGallery.initStatic){
yevwke.panelGallery.initStatic();
}
return;
}
try{
const catalog=await window.Yevwke.data.loadCatalog();
const container=document.getElementById("projects-groups");
if(container&&container.dataset.prerendered!=="true"){
window.Yevwke.projects.render(catalog);
}
window.Yevwke.panel.init();
if(window.Yevwke.panelGallery&&window.Yevwke.panelGallery.initStatic){
window.Yevwke.panelGallery.initStatic();
}
if(window.Yevwke.galleryLightbox){
window.Yevwke.galleryLightbox.init();
}
}catch(error){
const container=document.getElementById("projects-groups");
if(container&&container.dataset.prerendered!=="true"){
window.Yevwke.projects.renderError("Не удалось загрузить проекты.");
}
console.error(error);
}
});