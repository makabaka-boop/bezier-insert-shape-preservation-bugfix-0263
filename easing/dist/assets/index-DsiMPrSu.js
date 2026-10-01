(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const I=globalThis,G=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),rt=new WeakMap;let xt=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(G&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=rt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&rt.set(e,t))}return t}toString(){return this.cssText}};const Ot=r=>new xt(typeof r=="string"?r:r+"",void 0,Q),Tt=(r,...t)=>{const e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new xt(e,r,Q)},Ct=(r,t)=>{if(G)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),i=I.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},ot=G?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Ot(e)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Nt,defineProperty:Ut,getOwnPropertyDescriptor:Rt,getOwnPropertyNames:Ht,getOwnPropertySymbols:Lt,getPrototypeOf:It}=Object,W=globalThis,nt=W.trustedTypes,Dt=nt?nt.emptyScript:"",jt=W.reactiveElementPolyfillSupport,P=(r,t)=>r,j={toAttribute(r,t){switch(t){case Boolean:r=r?Dt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},tt=(r,t)=>!Nt(r,t),at={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:tt};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=at){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Ut(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:o}=Rt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){const h=i?.call(this);o?.call(this,n),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??at}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;const t=It(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){const e=this.properties,s=[...Ht(e),...Lt(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(ot(i))}else t!==void 0&&e.push(ot(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ct(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const o=(s.converter?.toAttribute!==void 0?s.converter:j).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:j;this._$Em=i;const h=n.fromAttribute(e,o.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){const n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??tt)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,o]of s){const{wrapped:n}=o,h=this[i];n!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,o,h)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[P("elementProperties")]=new Map,A[P("finalized")]=new Map,jt?.({ReactiveElement:A}),(W.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const et=globalThis,ht=r=>r,z=et.trustedTypes,ct=z?z.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,At="?"+y,zt=`<${At}>`,b=document,T=()=>b.createComment(""),C=r=>r===null||typeof r!="object"&&typeof r!="function",st=Array.isArray,Kt=r=>st(r)||typeof r?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,lt=/-->/g,dt=/>/g,v=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,pt=/"/g,wt=/^(?:script|style|textarea|title)$/i,Ft=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),$=Ft(1),w=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),ft=new WeakMap,g=b.createTreeWalker(b,129);function kt(r,t){if(!st(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return ct!==void 0?ct.createHTML(t):t}const Wt=(r,t)=>{const e=r.length-1,s=[];let i,o=t===2?"<svg>":t===3?"<math>":"",n=E;for(let h=0;h<e;h++){const a=r[h];let c,l,d=-1,u=0;for(;u<a.length&&(n.lastIndex=u,l=n.exec(a),l!==null);)u=n.lastIndex,n===E?l[1]==="!--"?n=lt:l[1]!==void 0?n=dt:l[2]!==void 0?(wt.test(l[2])&&(i=RegExp("</"+l[2],"g")),n=v):l[3]!==void 0&&(n=v):n===v?l[0]===">"?(n=i??E,d=-1):l[1]===void 0?d=-2:(d=n.lastIndex-l[2].length,c=l[1],n=l[3]===void 0?v:l[3]==='"'?pt:ut):n===pt||n===ut?n=v:n===lt||n===dt?n=E:(n=v,i=void 0);const p=n===v&&r[h+1].startsWith("/>")?" ":"";o+=n===E?a+zt:d>=0?(s.push(c),a.slice(0,d)+_t+a.slice(d)+y+p):a+y+(d===-2?h:p)}return[kt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class N{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0;const h=t.length-1,a=this.parts,[c,l]=Wt(t,e);if(this.el=N.createElement(c,s),g.currentNode=this.el.content,e===2||e===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=g.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(const d of i.getAttributeNames())if(d.endsWith(_t)){const u=l[n++],p=i.getAttribute(d).split(y),m=/([.?@])?(.*)/.exec(u);a.push({type:1,index:o,name:m[2],strings:p,ctor:m[1]==="."?Bt:m[1]==="?"?Vt:m[1]==="@"?Yt:q}),i.removeAttribute(d)}else d.startsWith(y)&&(a.push({type:6,index:o}),i.removeAttribute(d));if(wt.test(i.tagName)){const d=i.textContent.split(y),u=d.length-1;if(u>0){i.textContent=z?z.emptyScript:"";for(let p=0;p<u;p++)i.append(d[p],T()),g.nextNode(),a.push({type:2,index:++o});i.append(d[u],T())}}}else if(i.nodeType===8)if(i.data===At)a.push({type:2,index:o});else{let d=-1;for(;(d=i.data.indexOf(y,d+1))!==-1;)a.push({type:7,index:o}),d+=y.length-1}o++}}static createElement(t,e){const s=b.createElement("template");return s.innerHTML=t,s}}function k(r,t,e=r,s){if(t===w)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl;const o=C(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=k(r,i._$AS(r,t.values),i,s)),t}class qt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??b).importNode(e,!0);g.currentNode=i;let o=g.nextNode(),n=0,h=0,a=s[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new U(o,o.nextSibling,this,t):a.type===1?c=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(c=new Xt(o,this,t)),this._$AV.push(c),a=s[++h]}n!==a?.index&&(o=g.nextNode(),n++)}return g.currentNode=b,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class U{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),C(t)?t===f||t==null||t===""?(this._$AH!==f&&this._$AR(),this._$AH=f):t!==this._$AH&&t!==w&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Kt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==f&&C(this._$AH)?this._$AA.nextSibling.data=t:this.T(b.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=N.createElement(kt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const o=new qt(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new N(t)),e}k(t){st(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const o of t)i===e.length?e.push(s=new U(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const s=ht(t).nextSibling;ht(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=f,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=f}_$AI(t,e=this,s,i){const o=this.strings;let n=!1;if(o===void 0)t=k(this,t,e,0),n=!C(t)||t!==this._$AH&&t!==w,n&&(this._$AH=t);else{const h=t;let a,c;for(t=o[0],a=0;a<o.length-1;a++)c=k(this,h[s+a],e,a),c===w&&(c=this._$AH[a]),n||=!C(c)||c!==this._$AH[a],c===f?t=f:t!==f&&(t+=(c??"")+o[a+1]),this._$AH[a]=c}n&&!i&&this.j(t)}j(t){t===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Bt extends q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===f?void 0:t}}class Vt extends q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==f)}}class Yt extends q{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??f)===w)return;const s=this._$AH,i=t===f&&s!==f||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==f&&(s===f||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Xt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}}const Jt=et.litHtmlPolyfillSupport;Jt?.(N,U),(et.litHtmlVersions??=[]).push("3.3.3");const Zt=(r,t,e)=>{const s=e?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const o=e?.renderBefore??null;s._$litPart$=i=new U(t.insertBefore(T(),o),o,void 0,e??{})}return i._$AI(r),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const it=globalThis;class M extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Zt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}}M._$litElement$=!0,M.finalized=!0,it.litElementHydrateSupport?.({LitElement:M});const Gt=it.litElementPolyfillSupport;Gt?.({LitElement:M});(it.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Qt=r=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:tt},ee=(r=te,t,e)=>{const{kind:s,metadata:i}=e;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),o.set(e.name,r),s==="accessor"){const{name:n}=e;return{set(h){const a=t.get.call(this);t.set.call(this,h),this.requestUpdate(n,a,r,!0,h)},init(h){return h!==void 0&&this.C(n,void 0,r,h),h}}}if(s==="setter"){const{name:n}=e;return function(h){const a=this[n];t.call(this,h),this.requestUpdate(n,a,r,!0,h)}}throw Error("Unsupported decorator location: "+s)};function se(r){return(t,e)=>typeof e=="object"?ee(r,t,e):((s,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(i,o):void 0})(r,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function B(r){return se({...r,state:!0,attribute:!1})}const Z=2,O=20,mt=0,yt=1,K=-2,F=2,D=1e-7,J=1e-10,S=1e-12;function ie(r){if(!r||!Array.isArray(r.keyframes)||!Array.isArray(r.controls))throw new Error("spec must contain keyframes and controls arrays");const{keyframes:t,controls:e}=r;if(t.length<Z||t.length>O)throw new Error(`keyframe count must be ${Z}..${O}, got ${t.length}`);if(e.length!==t.length-1)throw new Error(`expected ${t.length-1} control pairs, got ${e.length}`);for(const s of t){if(!Number.isFinite(s.t)||!Number.isInteger(s.t))throw new Error(`keyframe time must be an integer, got ${s.t}`);if(!Number.isFinite(s.v))throw new Error(`keyframe value must be finite, got ${s.v}`)}for(let s=1;s<t.length;s++)if(t[s].t<=t[s-1].t)throw new Error(`keyframe times must be strictly increasing: t[${s-1}]=${t[s-1].t}, t[${s}]=${t[s].t}`);for(let s=0;s<e.length;s++){const i=e[s];for(const[o,n,h,a]of[["x1",i.x1,mt,yt],["x2",i.x2,mt,yt],["y1",i.y1,K,F],["y2",i.y2,K,F]])if(!Number.isFinite(n)||n<h||n>a)throw new Error(`control ${o} of segment ${s} must be in [${h}, ${a}], got ${n}`);if(i.yAbs1!==void 0&&!Number.isFinite(i.yAbs1))throw new Error(`control yAbs1 of segment ${s} must be finite, got ${i.yAbs1}`);if(i.yAbs2!==void 0&&!Number.isFinite(i.yAbs2))throw new Error(`control yAbs2 of segment ${s} must be finite, got ${i.yAbs2}`)}}function Et(r,t,e){const s=e-t;return[r.yAbs1??t+r.y1*s,r.yAbs2??t+r.y2*s]}function vt(r,t,e,s,i){const o=1-i,n=o*r+i*t,h=o*t+i*e,a=o*e+i*s,c=o*n+i*h,l=o*h+i*a,d=o*c+i*l;return{left:[r,n,c,d],right:[d,l,a,s]}}function St(r,t,e){const s=1-e;return 3*s*s*e*r+3*s*e*e*t+e*e*e}function Pt(r,t,e,s,i){const o=1-i;return o*o*o*r+3*o*o*i*t+3*o*i*i*e+i*i*i*s}function re(r,t,e,s){const i=3*(s-3*e+3*t-r),o=6*(e-2*t+r),n=3*(t-r),h=[];if(Math.abs(i)<S)Math.abs(o)>S&&h.push(-n/o);else{const c=o*o-4*i*n;if(c>=0){const l=Math.sqrt(c);h.push((-o-l)/(2*i),(-o+l)/(2*i))}}const a=h.filter(c=>c>S&&c<1-S).sort((c,l)=>c-l);return a.filter((c,l)=>l===0||c-a[l-1]>S)}function Mt(r,t,e){let s=r(t);for(let i=0;i<80;i++){const o=(t+e)/2,n=r(o);if(n===0)return o;s*n<0?e=o:(t=o,s=n)}return(t+e)/2}function $t(r,t,e){const s=Math.min(1,Math.max(0,e));return s===0?0:s===1?1:Mt(i=>St(r,t,i)-s,0,1)}function oe(r,t,e,s,i){if(r===t&&t===e&&e===s)return[];const o=a=>Pt(r,t,e,s,a)-i,n=[0,...re(r,t,e,s),1],h=[];for(let a=0;a<n.length-1;a++){const c=n[a],l=n[a+1],d=o(c);if(Math.abs(d)<=J){h.push(c);continue}const u=o(l);Math.abs(u)<=J||d*u<0&&h.push(Mt(o,c,l))}return Math.abs(o(1))<=J&&h.push(1),h.sort((a,c)=>a-c),h.filter((a,c)=>c===0||a-h[c-1]>D)}class gt{constructor(t){ie(t),this.spec={keyframes:t.keyframes.map(e=>({...e})),controls:t.controls.map(e=>({...e}))}}get keyframes(){return this.spec.keyframes}get controls(){return this.spec.controls}get t0(){return this.spec.keyframes[0].t}get t1(){return this.spec.keyframes[this.spec.keyframes.length-1].t}segmentIndex(t){const e=this.spec.keyframes,s=Math.min(Math.max(t,this.t0),this.t1);let i=0,o=e.length-1;for(;i<o;){const n=i+o>>1;e[n+1].t<s?i=n+1:o=n}return i}yControls(t){return Et(this.spec.controls[t],this.spec.keyframes[t].v,this.spec.keyframes[t+1].v)}splitSegment(t,e){const s=this.spec.keyframes,i=s[t],o=s[t+1];if(!Number.isInteger(e)||e<=i.t||e>=o.t)throw new Error(`split time must be an integer strictly between ${i.t} and ${o.t}, got ${e}`);const n=this.spec.controls[t],h=(e-i.t)/(o.t-i.t),a=$t(n.x1,n.x2,h),c=vt(0,n.x1,n.x2,1,a),[l,d]=this.yControls(t),u=vt(i.v,l,d,o.v,a),p=u.left[3],m=Y=>Math.min(1,Math.max(0,Y)),H={x1:m(c.left[1]/h),x2:m(c.left[2]/h),y1:1/3,y2:2/3,yAbs1:u.left[1],yAbs2:u.left[2]},L=1-h,V={x1:m((c.right[1]-h)/L),x2:m((c.right[2]-h)/L),y1:1/3,y2:2/3,yAbs1:u.right[1],yAbs2:u.right[2]};return{keyframe:{t:e,v:p},controls:[H,V]}}evaluate(t){const e=this.spec.keyframes;if(t<=this.t0)return e[0].v;if(t>=this.t1)return e[e.length-1].v;const s=this.segmentIndex(t),i=e[s],o=e[s+1],n=this.spec.controls[s],h=$t(n.x1,n.x2,(t-i.t)/(o.t-i.t)),[a,c]=this.yControls(s);return Pt(i.v,a,c,o.v,h)}solveThreshold(t){const e=this.spec.keyframes,s=[],i=[];for(let h=0;h<e.length-1;h++){const a=e[h],c=e[h+1],l=this.spec.controls[h],[d,u]=this.yControls(h);if(a.v===c.v&&a.v===d&&d===u){if(a.v===t){const p=i[i.length-1];p&&p[1]===a.t?p[1]=c.t:i.push([a.t,c.t])}continue}for(const p of oe(a.v,d,u,c.v,t))s.push(a.t+St(l.x1,l.x2,p)*(c.t-a.t))}s.sort((h,a)=>h-a);const o=[];for(const h of s){const a=o[o.length-1];a===void 0||h-a>D?o.push(h):o[o.length-1]=(a+h)/2}return{times:o.filter(h=>!i.some(([a,c])=>h>=a-D&&h<=c+D)),intervals:i}}}class ne{constructor(t){this.revision=0,this.thresholdCache=new Map,this.listeners=new Set,this.curve=new gt(t)}get current(){return this.curve}get currentRevision(){return this.revision}get spec(){return this.curve.spec}evaluate(t){return this.curve.evaluate(t)}solveThreshold(t){const e=this.thresholdCache.get(t);if(e)return e;const s=this.curve.solveThreshold(t);return this.thresholdCache.set(t,s),s}sample(t){const{t0:e,t1:s}=this.curve,i=[];for(let o=0;o<=t;o++){const n=e+(s-e)*o/t;i.push({t:n,v:this.curve.evaluate(n)})}return i}update(t){this.curve=new gt(t),this.revision++,this.thresholdCache.clear(),this.emit()}updateKeyframe(t,e){const s=this.curve.spec,i=s.keyframes.map((o,n)=>n===t?{...e}:{...o});this.update({keyframes:i,controls:s.controls.map(o=>({...o}))})}updateControl(t,e){const s=this.curve.spec,i=s.controls.map((o,n)=>n===t?{...e}:{...o});this.update({keyframes:s.keyframes.map(o=>({...o})),controls:i})}insertKeyframe(t){const e=this.curve.spec;let s=-1;for(let h=0;h<e.keyframes.length-1;h++)if(t.t>e.keyframes[h].t&&t.t<e.keyframes[h+1].t){s=h;break}if(s<0)throw new Error(`insertion time ${t.t} must lie strictly between existing keyframes`);const i=this.curve.splitSegment(s,t.t),o=[...e.keyframes.slice(0,s+1).map(h=>({...h})),{...i.keyframe},...e.keyframes.slice(s+1).map(h=>({...h}))],n=[...e.controls.slice(0,s).map(h=>({...h})),{...i.controls[0]},{...i.controls[1]},...e.controls.slice(s+1).map(h=>({...h}))];this.update({keyframes:o,controls:n})}removeKeyframe(t){const e=this.curve.spec,s=e.keyframes.filter((n,h)=>h!==t).map(n=>({...n})),i=Math.min(t,e.controls.length-1),o=e.controls.filter((n,h)=>h!==i).map(n=>({...n}));this.update({keyframes:s,controls:o})}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}emit(){for(const t of this.listeners)t()}}var ae=Object.defineProperty,he=Object.getOwnPropertyDescriptor,R=(r,t,e,s)=>{for(var i=s>1?void 0:s?he(t,e):t,o=r.length-1,n;o>=0;o--)(n=r[o])&&(i=(s?n(t,e,i):n(i))||i);return s&&i&&ae(t,e,i),i};const _={left:52,right:20,top:18,bottom:30};function bt(){return{keyframes:[{t:0,v:0},{t:6,v:1},{t:14,v:.2}],controls:[{x1:.25,y1:1.6,x2:.6,y2:1},{x1:.4,y1:0,x2:.7,y2:-.8}]}}let x=class extends M{constructor(){super(...arguments),this.store=new ne(bt()),this.cursorT=3,this.threshold=.5,this.exportText="",this.drag=null,this.view=null}connectedCallback(){super.connectedCallback(),this.unsubscribe=this.store.subscribe(()=>this.requestUpdate())}disconnectedCallback(){this.unsubscribe?.(),super.disconnectedCallback()}firstUpdated(){this.canvas=this.renderRoot.querySelector("canvas"),this.ctx=this.canvas.getContext("2d"),typeof ResizeObserver<"u"&&new ResizeObserver(()=>this.draw()).observe(this.canvas),this.draw()}updated(){this.draw()}computeView(){const r=window.devicePixelRatio||1,t=this.canvas.clientWidth,e=this.canvas.clientHeight;(this.canvas.width!==t*r||this.canvas.height!==e*r)&&(this.canvas.width=t*r,this.canvas.height=e*r),this.ctx.setTransform(r,0,0,r,0,0);const s=this.store.spec,i=s.keyframes[0].t,o=s.keyframes[s.keyframes.length-1].t;let n=1/0,h=-1/0;for(const c of s.keyframes)n=Math.min(n,c.v),h=Math.max(h,c.v);for(let c=0;c<s.controls.length;c++){const l=this.controlPoint(c,1),d=this.controlPoint(c,2);n=Math.min(n,l.v,d.v),h=Math.max(h,l.v,d.v)}for(const c of this.store.sample(200))n=Math.min(n,c.v),h=Math.max(h,c.v);n=Math.min(n,this.threshold),h=Math.max(h,this.threshold);const a=Math.max(.2,(h-n)*.12);return{left:_.left,top:_.top,width:t-_.left-_.right,height:e-_.top-_.bottom,t0:i,t1:o,vMin:n-a,vMax:h+a}}xOf(r){const t=this.view;return t.left+(r-t.t0)/(t.t1-t.t0)*t.width}yOf(r){const t=this.view;return t.top+t.height-(r-t.vMin)/(t.vMax-t.vMin)*t.height}timeAt(r){const t=this.view;return t.t0+(r-t.left)/t.width*(t.t1-t.t0)}valueAt(r){const t=this.view;return t.vMin+(t.top+t.height-r)/t.height*(t.vMax-t.vMin)}controlPoint(r,t){const e=this.store.spec,s=e.keyframes[r],i=e.keyframes[r+1],o=e.controls[r],n=i.t-s.t,[h,a]=Et(o,s.v,i.v);return t===1?{t:s.t+o.x1*n,v:h,absoluteY:o.yAbs1!==void 0}:{t:s.t+o.x2*n,v:a,absoluteY:o.yAbs2!==void 0}}draw(){if(!this.ctx)return;this.view=this.computeView();const r=this.view,t=this.ctx,e=this.store.spec;t.clearRect(0,0,this.canvas.clientWidth,this.canvas.clientHeight),t.strokeStyle="#1d2330",t.fillStyle="#5b6b8c",t.font="10px ui-monospace, monospace",t.lineWidth=1;for(let a=r.t0;a<=r.t1;a++){const c=this.xOf(a);t.beginPath(),t.moveTo(c,r.top),t.lineTo(c,r.top+r.height),t.stroke(),t.fillText(String(a),c-3,r.top+r.height+14)}const s=6;for(let a=0;a<=s;a++){const c=r.vMin+(r.vMax-r.vMin)*a/s,l=this.yOf(c);t.beginPath(),t.moveTo(r.left,l),t.lineTo(r.left+r.width,l),t.stroke(),t.fillText(c.toFixed(2),6,l+3)}const i=this.store.solveThreshold(this.threshold);t.strokeStyle="#e0a33e",t.lineWidth=5;for(const[a,c]of i.intervals)t.beginPath(),t.moveTo(this.xOf(a),this.yOf(this.threshold)),t.lineTo(this.xOf(c),this.yOf(this.threshold)),t.stroke();t.strokeStyle="#5ec1ff",t.lineWidth=2,t.beginPath();for(let a=0;a<=r.width;a++){const c=this.timeAt(r.left+a),l=this.yOf(this.store.evaluate(c));a===0?t.moveTo(r.left,l):t.lineTo(r.left+a,l)}t.stroke(),t.lineWidth=1;for(let a=0;a<e.controls.length;a++){const c=e.keyframes[a],l=e.keyframes[a+1],d=[[this.controlPoint(a,1).t,this.controlPoint(a,1).v,this.controlPoint(a,1).absoluteY],[this.controlPoint(a,2).t,this.controlPoint(a,2).v,this.controlPoint(a,2).absoluteY]],u=[[c.t,c.v],[l.t,l.v]];for(let p=0;p<2;p++){const[m,H,L]=d[p],[V,Y]=u[p];t.strokeStyle="#7a5fb0",t.beginPath(),t.moveTo(this.xOf(V),this.yOf(Y)),t.lineTo(this.xOf(m),this.yOf(H)),t.stroke(),t.fillStyle=L?"#e88fb8":"#b08fe8",t.beginPath(),t.arc(this.xOf(m),this.yOf(H),5,0,Math.PI*2),t.fill()}}for(const a of e.keyframes)t.fillStyle="#ffd76a",t.beginPath(),t.arc(this.xOf(a.t),this.yOf(a.v),6,0,Math.PI*2),t.fill(),t.strokeStyle="#14171d",t.stroke();const o=this.yOf(this.threshold);t.strokeStyle="#e0a33e",t.setLineDash([6,4]),t.lineWidth=1.5,t.beginPath(),t.moveTo(r.left,o),t.lineTo(r.left+r.width,o),t.stroke(),t.setLineDash([]),t.fillStyle="#e0a33e";for(const a of i.times)t.beginPath(),t.arc(this.xOf(a),o,4.5,0,Math.PI*2),t.fill();const n=this.xOf(this.cursorT),h=this.store.evaluate(this.cursorT);t.strokeStyle="#7ee787",t.lineWidth=1.5,t.beginPath(),t.moveTo(n,r.top),t.lineTo(n,r.top+r.height),t.stroke(),t.fillStyle="#7ee787",t.beginPath(),t.arc(n,this.yOf(h),5,0,Math.PI*2),t.fill(),t.fillText(`t=${this.cursorT.toFixed(3)}  v=${h.toFixed(4)}`,Math.min(n+8,r.left+r.width-130),r.top+12)}canvasPos(r){const t=this.canvas.getBoundingClientRect();return[r.clientX-t.left,r.clientY-t.top]}hitTest(r,t){const e=this.store.spec;for(let s=0;s<e.keyframes.length;s++){const i=e.keyframes[s];if(Math.hypot(r-this.xOf(i.t),t-this.yOf(i.v))<=9)return{kind:"key",index:s}}for(let s=0;s<e.controls.length;s++){const i=[this.controlPoint(s,1),this.controlPoint(s,2)];for(let o=0;o<i.length;o++){const n=i[o];if(Math.hypot(r-this.xOf(n.t),t-this.yOf(n.v))<=8)return{kind:"cp",segment:s,which:o+1}}}return Math.abs(r-this.xOf(this.cursorT))<=6?{kind:"cursor"}:Math.abs(t-this.yOf(this.threshold))<=6?{kind:"threshold"}:null}onPointerDown(r){const[t,e]=this.canvasPos(r),s=this.hitTest(t,e);if(s?.kind==="key"&&r.altKey){this.store.spec.keyframes.length>Z&&this.store.removeKeyframe(s.index);return}this.drag=s??{kind:"cursor"},this.drag.kind==="cursor"&&(this.cursorT=this.clampTime(this.timeAt(t))),this.canvas.setPointerCapture(r.pointerId)}onPointerMove(r){if(!this.drag)return;const[t,e]=this.canvasPos(r),s=this.store.spec,i=this.drag;if(i.kind==="key"){const o=s.keyframes[i.index-1],n=s.keyframes[i.index+1],h=o?o.t+1:-1/0,a=n?n.t-1:1/0,c=Math.min(a,Math.max(h,Math.round(this.timeAt(t))));this.store.updateKeyframe(i.index,{t:c,v:this.valueAt(e)})}else if(i.kind==="cp"){const o=i.segment,n=s.keyframes[o],h=s.keyframes[o+1],a=h.t-n.t,c=Math.min(1,Math.max(0,(this.timeAt(t)-n.t)/a)),l={...s.controls[o]};if(this.controlPoint(o,i.which).absoluteY)i.which===1?(l.x1=c,l.yAbs1=this.valueAt(e)):(l.x2=c,l.yAbs2=this.valueAt(e));else{const d=h.v-n.v,u=d===0?0:Math.min(F,Math.max(K,(this.valueAt(e)-n.v)/d));i.which===1?(l.x1=c,l.y1=u):(l.x2=c,l.y2=u)}this.store.updateControl(o,l)}else i.kind==="cursor"?this.cursorT=this.clampTime(this.timeAt(t)):this.threshold=this.valueAt(e)}onPointerUp(){this.drag=null}onDoubleClick(r){const[t,e]=this.canvasPos(r);if(this.hitTest(t,e))return;const s=this.store.spec;if(s.keyframes.length>=O)return;const i=Math.round(this.timeAt(t));i<=s.keyframes[0].t||i>=s.keyframes[s.keyframes.length-1].t||s.keyframes.some(o=>o.t===i)||this.store.insertKeyframe({t:i})}clampTime(r){const t=this.store.spec;return Math.min(t.keyframes[t.keyframes.length-1].t,Math.max(t.keyframes[0].t,r))}setKeyframeT(r,t){const e=Number(t.target.value);if(!Number.isInteger(e))return;const s=this.store.spec,i=s.keyframes[r-1],o=s.keyframes[r+1];i&&e<=i.t||o&&e>=o.t||this.store.updateKeyframe(r,{t:e,v:s.keyframes[r].v})}setKeyframeV(r,t){const e=Number(t.target.value);Number.isFinite(e)&&this.store.updateKeyframe(r,{t:this.store.spec.keyframes[r].t,v:e})}setControl(r,t,e){const s=Number(e.target.value);if(!Number.isFinite(s))return;const i={...this.store.spec.controls[r],[t]:s};try{this.store.updateControl(r,i)}catch{}}addKeyframe(){const r=this.store.spec;if(r.keyframes.length>=O)return;let t=0,e=-1;for(let i=0;i<r.keyframes.length-1;i++){const o=r.keyframes[i+1].t-r.keyframes[i].t;o>e&&(e=o,t=i)}if(e<2)return;const s=r.keyframes[t].t+Math.floor(e/2);this.store.insertKeyframe({t:s})}reset(){this.store.update(bt()),this.cursorT=3,this.threshold=.5,this.exportText=""}doExport(){const r=this.store.solveThreshold(this.threshold),t={revision:this.store.currentRevision,spec:this.store.spec,cursor:{t:this.cursorT,v:this.store.evaluate(this.cursorT)},threshold:{value:this.threshold,times:r.times,intervals:r.intervals},samples:this.store.sample(200)};this.exportText=JSON.stringify(t,null,1)}download(){this.exportText||this.doExport();const r=new Blob([this.exportText],{type:"application/json"}),t=document.createElement("a");t.href=URL.createObjectURL(r),t.download="easing-export.json",t.click(),URL.revokeObjectURL(t.href)}render(){const r=this.store.spec,t=this.store.solveThreshold(this.threshold),e=this.store.evaluate(this.cursorT),s=i=>Number(i.toFixed(6)).toString();return $`
      <div class="layout">
        <div class="canvas-wrap">
          <canvas
            @pointerdown=${this.onPointerDown}
            @pointermove=${this.onPointerMove}
            @pointerup=${this.onPointerUp}
            @pointerleave=${this.onPointerUp}
            @dblclick=${this.onDoubleClick}
          ></canvas>
          <div class="hint" style="color:#6b7a95;font-size:12px;margin-top:6px">
            拖动关键帧 / 控制柄 / 绿线游标 / 橙色阈值线；双击空白处在曲线上添加关键帧；Alt+点击关键帧删除。
          </div>
        </div>
        <div class="panel">
          <fieldset>
            <legend>游标 / 阈值</legend>
            <label>t
              <input type="number" step="0.1" .value=${String(this.cursorT)}
                @change=${i=>{this.cursorT=this.clampTime(Number(i.target.value))}} />
            </label>
            <span class="readout">v=${e.toFixed(6)}</span><br />
            <label>阈值
              <input type="number" step="0.05" .value=${String(this.threshold)}
                @change=${i=>{this.threshold=Number(i.target.value)}} />
            </label>
            <div class="readout">
              穿越时刻: [${t.times.map(s).join(", ")}]
              ${t.intervals.length?$`<br />恒等区间: ${t.intervals.map(([i,o])=>`[${s(i)}, ${s(o)}]`).join(", ")}`:""}
            </div>
          </fieldset>
          <fieldset>
            <legend>关键帧 (${r.keyframes.length}/${O})</legend>
            ${r.keyframes.map((i,o)=>$`
                <div class="kf-row">
                  <span class="tag">#${o}</span>
                  <label>t
                    <input type="number" step="1" .value=${String(i.t)}
                      @change=${n=>this.setKeyframeT(o,n)} />
                  </label>
                  <label>v
                    <input type="number" step="0.01" .value=${String(i.v)}
                      @change=${n=>this.setKeyframeV(o,n)} />
                  </label>
                </div>
              `)}
            <button @click=${this.addKeyframe}>添加关键帧</button>
            <button @click=${this.reset}>重置</button>
          </fieldset>
          <fieldset>
            <legend>控制点 (x∈[0,1]，y∈[${K},${F}]；ya 为绝对数值空间)</legend>
            ${r.controls.map((i,o)=>$`
                <div class="cp-row">
                  <span class="tag">段 ${o}</span>
                  ${["x1","x2"].map(n=>$`
                      <label>${n}
                        <input type="number" step="0.01" .value=${i[n].toFixed(3)}
                          @change=${h=>this.setControl(o,n,h)} />
                      </label>
                    `)}
                  ${[["yAbs1","ya1",this.controlPoint(o,1).v],["yAbs2","ya2",this.controlPoint(o,2).v]].map(([n,h,a])=>$`
                      <label title="绝对数值空间控制点（由保形切分产生）">${h}
                        <input type="number" step="0.01" .value=${a.toFixed(3)}
                          @change=${c=>this.setControl(o,n,c)} />
                      </label>
                    `)}
                  ${["y1","y2"].map(n=>$`
                      <label>${n}
                        <input type="number" step="0.01" .value=${i[n].toFixed(3)}
                          ?disabled=${this.controlPoint(o,n==="y1"?1:2).absoluteY}
                          @change=${h=>this.setControl(o,n,h)} />
                      </label>
                    `)}
                </div>
              `)}
          </fieldset>
          <fieldset>
            <legend>导出 (与画布/游标同一求值结果, rev ${this.store.currentRevision})</legend>
            <button @click=${this.doExport}>生成 JSON</button>
            <button @click=${this.download}>下载</button>
            <textarea readonly .value=${this.exportText}></textarea>
          </fieldset>
        </div>
      </div>
    `}};x.styles=Tt`
    :host {
      display: block;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #d7dde8;
      background: #14171d;
      border-radius: 10px;
      padding: 16px;
    }
    .layout {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .canvas-wrap {
      flex: 1 1 520px;
      min-width: 320px;
    }
    canvas {
      width: 100%;
      height: 440px;
      display: block;
      background: #0d1015;
      border: 1px solid #2a3040;
      border-radius: 8px;
      cursor: crosshair;
      touch-action: none;
    }
    .panel {
      flex: 0 1 300px;
      min-width: 260px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13px;
    }
    fieldset {
      border: 1px solid #2a3040;
      border-radius: 8px;
      padding: 8px 10px;
      margin: 0;
    }
    legend {
      padding: 0 6px;
      color: #8fa3c8;
    }
    label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 2px 8px 2px 0;
    }
    input[type='number'] {
      width: 64px;
      background: #0d1015;
      color: #d7dde8;
      border: 1px solid #2a3040;
      border-radius: 4px;
      padding: 2px 4px;
    }
    input[type='number']:disabled {
      opacity: 0.35;
    }
    button {
      background: #22314f;
      color: #d7dde8;
      border: 1px solid #38507e;
      border-radius: 6px;
      padding: 4px 10px;
      cursor: pointer;
      margin-right: 6px;
    }
    button:hover {
      background: #2c4067;
    }
    .readout {
      font-family: ui-monospace, monospace;
      font-size: 12px;
      color: #9fd3a8;
      word-break: break-all;
      white-space: pre-wrap;
    }
    textarea {
      width: 100%;
      height: 120px;
      box-sizing: border-box;
      background: #0d1015;
      color: #9fd3a8;
      border: 1px solid #2a3040;
      border-radius: 6px;
      font-family: ui-monospace, monospace;
      font-size: 11px;
    }
    .hint {
      color: #6b7a95;
    }
    .kf-row,
    .cp-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 2px 0;
      flex-wrap: wrap;
    }
    .tag {
      color: #8fa3c8;
      min-width: 44px;
      display: inline-block;
    }
  `;R([B()],x.prototype,"store",2);R([B()],x.prototype,"cursorT",2);R([B()],x.prototype,"threshold",2);R([B()],x.prototype,"exportText",2);x=R([Qt("easing-editor")],x);
