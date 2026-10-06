
const assert=require('node:assert/strict');const fs=require('fs');
const origin='http://localhost:3001';
class Client {
 constructor(country='US'){this.cookies=new Map();this.country=country;}
 async req(path,body,extra={}) {const headers={origin,'x-vercel-ip-country':this.country,...extra};if(this.cookies.size)headers.cookie=[...this.cookies].map(([k,v])=>k+'='+v).join('; ');if(body)headers['content-type']='application/json';const r=await fetch(origin+path,{headers,method:body?'POST':'GET',body:body?JSON.stringify(body):undefined,redirect:'manual'});for(const c of r.headers.getSetCookie()){const [pair]=c.split(';');const k=pair.slice(0,pair.indexOf('=')),v=pair.slice(pair.indexOf('=')+1);this.cookies.set(k,v);}return {status:r.status,text:await r.text(),headers:r.headers};}
 async login(email){const r=await this.req('/api/auth/login',{email,password:'Review-only-2026!'});assert.equal(r.status,200,r.text);}
}
(async()=>{
 const parent=new Client();await parent.login('parent@review.local');
 const pref=await parent.req('/api/preferences',{locale:'en',units:'us',timeZone:'America/New_York',market:'GE',currency:'GEL'});assert.equal(pref.status,200);
 const referral=await parent.req('/api/referral');assert.equal(JSON.parse(referral.text).currency,'USD');
 assert.equal((await parent.req('/api/admin/preview',{market:'GE'})).status,403);
 assert.equal((await parent.req('/api/preferences',{locale:'ka'},{origin:'https://attacker.invalid'})).status,403);
 const dashboard=await parent.req('/dashboard?lang=en');assert.equal(dashboard.status,200,dashboard.text.slice(0,100));assert.match(dashboard.text,/Your dashboard/);assert.match(dashboard.headers.get('x-mommenu-cache-key'),/INTL-en$/);
 const me=JSON.parse((await parent.req('/api/auth/me')).text);
 const children=JSON.parse((await parent.req('/api/children?userId='+me.id)).text);
 const baby=children.find(c=>c.name==='Sam'),adult=children.find(c=>c.name==='Alex');
 assert(baby&&adult);
 const ingredients=JSON.parse((await parent.req('/api/baby-ingredients?childId='+baby.id)).text);
 assert(ingredients.length>0&&ingredients.every(i=>i.nameEn));
 const ingredient=ingredients.find(i=>i.nameEn==='Carrot'); assert(ingredient);
 assert.equal((await parent.req('/api/baby-ingredient-status',{childId:baby.id,ingredientId:ingredient.id,tried:true,liked:true})).status,200);
 const updated=JSON.parse((await parent.req('/api/baby-ingredients?childId='+baby.id)).text).find(i=>i.id===ingredient.id);assert.equal(updated.status.tried,true);
 const reactionHeaders={origin,'content-type':'application/json',cookie:[...parent.cookies].map(([k,v])=>k+'='+v).join('; ')};
 for(const [choice,other] of [['liked','disliked'],['disliked','liked']]){const r=await fetch(origin+'/api/baby-ingredient-status/'+updated.status.id,{method:'PATCH',headers:reactionHeaders,body:JSON.stringify({[choice]:true})});assert.equal(r.status,200);const status=await r.json();assert.equal(status[choice],true);assert.equal(status[other],false);}
 console.log('PASS: first-food reactions can be changed after tasting; liked and disliked replace each other');
 assert.equal((await parent.req('/api/baby-ingredient-status',{childId:baby.id,ingredientId:ingredient.id,tried:false,liked:null,disliked:null})).status,200);
 const shopping=await parent.req('/api/shopping-list?childId='+adult.id);assert.equal(shopping.status,200);const items=JSON.parse(shopping.text).ingredients;assert(items.length>0);assert(items.every(i=>!/[\u10a0-\u10ff]/i.test(i.display+i.amount)));assert(items.some(i=>/oz/.test(i.amount)));
 const ownDishes=JSON.parse((await parent.req('/api/baby-meal-suggestions/allowed-dishes?childId='+baby.id)).text);assert(Array.isArray(ownDishes.dishes));
 const invalidGoogle=await parent.req('/api/auth/google/callback?code=fake&state='+'x'.repeat(64));assert.equal(invalidGoogle.status,307);assert.match(invalidGoogle.headers.get('location'),/error=google/);
 const ge=new Client('US');await ge.login('georgian@review.local');await ge.req('/api/preferences',{locale:'en',market:'INTL'});assert.equal(JSON.parse((await ge.req('/api/referral')).text).currency,'GEL');const geMe=JSON.parse((await ge.req('/api/auth/me')).text),geChildren=JSON.parse((await ge.req('/api/children?userId='+geMe.id)).text);assert.equal((await parent.req('/api/baby-ingredients?childId='+geChildren[0].id)).status,404);assert.equal((await parent.req('/api/baby-ingredient-status',{childId:geChildren[0].id,ingredientId:ingredient.id,tried:true})).status,404);
 const subscription=await ge.req('/subscription?lang=en');assert.equal(subscription.status,200);assert.match(subscription.headers.get('x-mommenu-cache-key'),/GE-en$/);
 const owner=new Client();await owner.login('owner@review.local');assert.equal((await owner.req('/api/admin/preview',{market:'INTL'})).status,200);assert.equal((await owner.req('/api/subscription/bog-checkout',{interval:1})).status,409);
 for(const currency of ['GE','INTL']){for(const path of ['/admin/users','/admin/analytics']){const r=await owner.req(path+'?market='+currency);assert.equal(r.status,200,r.text.slice(0,200));assert(!r.text.includes('{currencySymbol}'));}}
 for(const path of ['/','/about','/how-it-works','/contact','/recipes','/blog','/terms','/privacy']){const r=await parent.req(path+'?lang=en');assert.equal(r.status,200,path+': '+r.status);fs.writeFileSync('../review-'+(path.slice(1)||'home')+'.html',r.text);console.log('PASS',path);}
 assert.equal((await owner.req('/admin/international-review')).status,200);
 const templates=await owner.req('/api/admin/emails/templates');assert.equal(templates.status,200);assert(JSON.parse(templates.text).every(t=>t.subjectEn&&t.bodyEn&&!/[\u10a0-\u10ff]/i.test(t.subjectEn+t.bodyEn)));
 const preview=await owner.req('/api/admin/email-preview?key=subscription_confirmed&lang=en&interval=3');assert.equal(preview.status,200);
 await owner.req('/api/admin/preview',{market:'AUTO'});await ge.req('/api/preferences',{locale:'ka'});await parent.req('/api/preferences',{units:'metric',timeZone:'UTC'});
 console.log('PASS: account currency persists while travelling and switching languages; preview/Origin restrictions; finance pages; public English pages.');
})().catch(e=>{console.error(e);process.exitCode=1;});
