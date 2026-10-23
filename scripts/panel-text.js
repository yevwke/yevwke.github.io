(function(){
"use strict";
function render(project,content,body){
const data=content||{};
const panel=document.createElement("div");
panel.className="text-panel";
const media=document.createElement("figure");
media.className="text-panel-media";
if(data.image){
const image=document.createElement("img");
const width=Number(data.imageWidth);
const height=Number(data.imageHeight);
image.className="text-panel-image";
image.src=window.Yevwke.data.resolveAsset(data.image);
image.alt=data.imageAlt||project.title||"";
image.loading="lazy";
image.decoding="async";
if(
Number.isFinite(width)&&
width>0&&
Number.isFinite(height)&&
height>0
){
image.width=width;
image.height=height;
}
media.appendChild(image);
}
panel.appendChild(media);
const contentBlock=document.createElement("div");
contentBlock.className="text-panel-content";
const heading=document.createElement("h2");
heading.className="text-panel-title";
heading.textContent=data.heading||project.title||"";
contentBlock.appendChild(heading);
if(data.text){
contentBlock.appendChild(
window.Yevwke.panelShared.createParagraphs(data.text)
);
}
const actions=window.Yevwke.panelShared.createActionLinks(
data.links,
"text-panel-actions",
"panel-button"
);
if(actions){
contentBlock.appendChild(actions);
}
panel.appendChild(contentBlock);
body.appendChild(panel);
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.panelText={render};
})();