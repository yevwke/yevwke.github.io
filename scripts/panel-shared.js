(function(){
"use strict";
function createActionLinks(links,actionsClass,buttonClass){
if(!Array.isArray(links)||!links.length){
return null;
}
const actions=document.createElement("div");
actions.className=actionsClass;
links.forEach((link)=>{
if(!link||!link.url){
return;
}
const anchor=document.createElement("a");
anchor.className=buttonClass;
anchor.href=link.url;
anchor.textContent=link.label||"";
if(link.download){
anchor.setAttribute(
"download",
typeof link.download==="string"?link.download:""
);
}else if(link.newTab!==false){
anchor.target="_blank";
anchor.rel="noopener noreferrer";
}
actions.appendChild(anchor);
});
return actions.children.length?actions:null;
}
function createParagraphs(text,className="text-panel-text"){
const block=document.createElement("div");
block.className=className;
if(!text){
return block;
}
text
.split(/\n\s*\n/)
.map((paragraph)=>paragraph.trim())
.filter(Boolean)
.forEach((paragraph,index)=>{
const item=document.createElement("p");
item.textContent=paragraph;
item.style.setProperty("--reveal-index",Math.min(index,8));
block.appendChild(item);
});
return block;
}
window.Yevwke=window.Yevwke||{};
window.Yevwke.panelShared={
createActionLinks,
createParagraphs
};
})();