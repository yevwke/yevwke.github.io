const BACKGROUND_SYMBOLS=[
"+","*","•","·","○","×","°","✦","◦","◇"
];
const BACKGROUND_COLORS=[
"#ffd9a8",
"#a8c8ff",
"#c9b6ff",
"#b6ffd9"
];
const BACKGROUND_MAX_DPR=2;
const BACKGROUND_RESIZE_DELAY_MS=150;
const BACKGROUND_MOBILE_FRAME_MS=1000/30;
function hexToRgb(hex){
const value=parseInt(hex.slice(1),16);
return{
r:(value>>16)&255,
g:(value>>8)&255,
b:value&255
};
}
function initBackground(){
const canvas=document.createElement("canvas");
canvas.id="bg-canvas";
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery=window.matchMedia("(max-width: 1200px)");
const colors=BACKGROUND_COLORS.map(hexToRgb);
let width=0;
let height=0;
let dpr=0;
let particles=[];
let frameId=null;
let resizeTimer=null;
let lastDraw=0;
function randomBetween(min,max){
return min+Math.random()*(max-min);
}
function createParticle(){
const size=randomBetween(8,16);
return{
x:Math.random()*width,
y:Math.random()*height,
speed:randomBetween(0.1,0.3),
drift:randomBetween(0.02,0.08),
phase:Math.random()*Math.PI*2,
size,
font:size+'px "SiteText", Arial, sans-serif',
opacity:randomBetween(0.05,0.16),
symbol:BACKGROUND_SYMBOLS[Math.floor(Math.random()*BACKGROUND_SYMBOLS.length)],
color:colors[Math.floor(Math.random()*colors.length)],
twinkleSpeed:randomBetween(0.001,0.003),
twinklePhase:Math.random()*Math.PI*2,
rotation:Math.random()*Math.PI*2,
rotationSpeed:randomBetween(-0.002,0.002)
};
}
function respawnParticles(){
const maxCount=mobileQuery.matches?45:90;
const count=Math.min(Math.floor((width*height)/9000),maxCount);
particles=Array.from({length:count},createParticle);
}
function resize(){
const nextWidth=window.innerWidth;
const nextHeight=window.innerHeight;
const nextDpr=Math.min(window.devicePixelRatio||1,BACKGROUND_MAX_DPR);
if(
nextWidth===width&&
nextHeight===height&&
nextDpr===dpr&&
canvas.width>0
){
return;
}
width=nextWidth;
height=nextHeight;
dpr=nextDpr;
canvas.width=Math.floor(width*dpr);
canvas.height=Math.floor(height*dpr);
canvas.style.width=width+"px";
canvas.style.height=height+"px";
ctx.setTransform(dpr,0,0,dpr,0,0);
respawnParticles();
}
function scheduleResize(){
if(resizeTimer!==null){
window.clearTimeout(resizeTimer);
}
resizeTimer=window.setTimeout(()=>{
resizeTimer=null;
resize();
},BACKGROUND_RESIZE_DELAY_MS);
}
function isPaused(){
if(reducedMotion.matches){
return true;
}
if(document.body.classList.contains("is-lightbox-open")){
return true;
}
return(
mobileQuery.matches&&
document.body.classList.contains("is-panel-open")
);
}
function draw(time){
ctx.clearRect(0,0,width,height);
for(const particle of particles){
particle.y-=particle.speed;
particle.x+=Math.sin(time*0.0005+particle.phase)*particle.drift;
particle.rotation+=particle.rotationSpeed;
if(particle.y<-24){
particle.y=height+24;
particle.x=Math.random()*width;
}
const flicker=0.5+0.5*Math.sin(time*particle.twinkleSpeed+particle.twinklePhase);
const r=Math.round(255+(particle.color.r-255)*flicker);
const g=Math.round(255+(particle.color.g-255)*flicker);
const b=Math.round(255+(particle.color.b-255)*flicker);
ctx.save();
ctx.translate(particle.x,particle.y);
ctx.rotate(particle.rotation);
ctx.globalAlpha=particle.opacity*(0.7+0.3*flicker);
ctx.fillStyle="rgb("+r+", "+g+", "+b+")";
ctx.font=particle.font;
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillText(particle.symbol,0,0);
ctx.restore();
}
}
function tick(time){
frameId=null;
if(isPaused()){
return;
}
if(
mobileQuery.matches&&
time-lastDraw<BACKGROUND_MOBILE_FRAME_MS
){
frameId=window.requestAnimationFrame(tick);
return;
}
lastDraw=time;
draw(time);
frameId=window.requestAnimationFrame(tick);
}
function start(){
if(frameId!==null||isPaused()){
return;
}
lastDraw=0;
frameId=window.requestAnimationFrame(tick);
}
function stop(){
if(frameId===null){
return;
}
window.cancelAnimationFrame(frameId);
frameId=null;
}
function refreshAnimation(){
if(isPaused()){
stop();
return;
}
start();
}
function subscribe(query,handler){
if(typeof query.addEventListener==="function"){
query.addEventListener("change",handler);
return;
}
query.addListener(handler);
}
resize();
window.addEventListener("resize",scheduleResize,{passive:true});
subscribe(reducedMotion,refreshAnimation);
subscribe(mobileQuery,refreshAnimation);
if(typeof window.MutationObserver==="function"){
const observer=new window.MutationObserver(refreshAnimation);
observer.observe(document.body,{
attributes:true,
attributeFilter:["class"]
});
}
start();
}