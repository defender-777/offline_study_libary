(()=>{var l=Object.freeze({HOME:"/",SUBJECT:"/subject",PLAYER:"/player",FAVORITES:"/favorites",HISTORY:"/history",SETTINGS:"/settings",SEARCH:"/search"}),Ve=Object.freeze([{label:"Library",route:l.HOME,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 8h10M7 12h10M7 16h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'},{label:"Subject",route:l.SUBJECT,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 7h8M8 11h8M8 15h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'},{label:"Player",route:l.PLAYER,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'},{label:"Favorites",route:l.FAVORITES,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.5l-5.5 3 1.5-6.5L3 9.5l6.8-1L12 3l2.2 5.5 6.8 1-5 4.5 1.5 6.5z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'},{label:"History",route:l.HISTORY,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'},{label:"Settings",route:l.SETTINGS,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 1-2.1-.7 1.7 1.7 0 0 0-2.8 0 1.7 1.7 0 0 1-2.1.7 1.7 1.7 0 0 0-1.9.3l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 1-.7-2.1 1.7 1.7 0 0 0 0-2.8 1.7 1.7 0 0 1 .7-2.1 1.7 1.7 0 0 0 .3-1.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 1 2.1-.7 1.7 1.7 0 0 0 2.8 0 1.7 1.7 0 0 1 2.1.7h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 1 .7 2.1 1.7 1.7 0 0 0 0 2.8 1.7 1.7 0 0 1-.7 2.1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'},{label:"Search",route:l.SEARCH,icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16.5 16.5l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'}]),E="Offline Study Library";var J={library:null,currentPage:l.HOME,selectedSubject:null,selectedVideo:null,searchQuery:"",favorites:[],history:[],continueWatching:[],settings:{},loading:!1,error:null},Se=new Set;function g(){return J}function w(e){return Object.assign(J,e),Se.forEach(t=>t(J)),J}function He(e){return Se.add(e),()=>Se.delete(e)}var Z=null;function Oe(e,t){if(!Array.isArray(e))throw new Error(`Library manifest must contain a valid ${t} array.`);return e}function er(e,t){if(!e)return null;if(t){let o=String(e).replace(/^\/+/,"").split("/");return o[o.length-1]=`${t}.jpg`,`../${o.map(a=>encodeURIComponent(a)).join("/")}`}return`../${String(e).replace(/^\/+/,"").split("/").map(o=>encodeURIComponent(o)).join("/")}`}function tr(e){if(!e||typeof e!="object")throw new Error("video metadata did not return an object.");let t=Oe(e.subjects,"subjects"),r=Oe(e.all_videos,"all_videos");return{...e,subjects:t,all_videos:r}}async function Pe(){if(Z)return Z;let e=globalThis.window?.VIDEO_DATA;if(!e)throw new Error("videos.js was not loaded. Regenerate the metadata files and open website/index.html again.");let t=tr(e);return Z=t,t}function F(){return Z?.subjects??[]}function x(){return Z?.all_videos??[]}function z(e){return x().find(t=>String(t.id)===String(e))??null}function Q(e){return e?x().filter(t=>String(t.subject)===String(e)):[]}function q(e){return e?typeof e.slug=="string"&&e.slug.trim()?e.slug.trim():typeof e.name=="string"?String(e.name).trim().toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""):"":""}function ee(e){return e?F().find(t=>q(t)===String(e).trim())??null:null}function Fe(){let e=F(),t=x();return{totalSubjects:e.length,totalVideos:t.length,subjects:e.map(r=>({name:r.name,count:Number(r.video_count??r.videos?.length??0)}))}}function T(e){return!e||!e.thumbnail?null:er(e.thumbnail,e.id)}function L(e){let t=e?.duration_formatted||e?.duration;if(!t)return"Unknown";let r=String(t).trim();return r==="00:00"||r==="0"||r==="0:00"||r==="0.0"?"Unknown":r}function rr(e){if(!e)return null;let t=String(e).match(/\b(\d{3,4}p)\b/i);return t?t[1].toLowerCase():null}function A(e){let t=e?.resolution;if(typeof t=="string"&&t.trim())return t.trim();if(t&&typeof t=="object"){let n=Number(t.width),o=Number(t.height);if(n>0&&o>0)return`${o}p`}let r=rr(e?.title||e?.display_title||e?.filename);return r||"Unknown"}function j({title:e,subtitle:t="",action:r=""}){return`
  <div class="section-header">
    <div>
      <h3>${e}</h3>
      ${t?`<span class="section-copy">${t}</span>`:""}
    </div>
    ${r?`<div class="section-action">${r}</div>`:""}
  </div>
  `}function B({label:e,value:t,helper:r}){return`
<article class="stat-card">
  <span class="card-meta">${e}</span>
  <strong class="stat-value">${t}</strong>
  <p class="card-copy">${r}</p>
</article>`.trim()}function Ne(e=""){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function nr(e){if(e==null)return!1;let t=g().favorites;if(!Array.isArray(t)||!t.length)return!1;let r=String(e);return t.some(n=>(n&&typeof n=="object"&&n.id!=null?String(n.id):String(n))===r)}function I({title:e,titleHtml:t,subject:r,subjectHtml:n,duration:o,resolution:i,thumbnail:a=null,progress:s=0,isNew:c=!1,description:p="",descriptionHtml:d,videoId:b=null,selected:h=!1,layout:k="poster"}){let v=b?` data-video-id="${String(b).replace(/"/g,"&quot;")}"`:"",m=h?" video-card--selected":"",V=k==="list"?" video-card--list":"",O=b!=null?String(b):"",u=nr(b),y=t||e||"Untitled",R=n||r||"",X=d||p||"",ie=o&&o!=="Unknown",S=i&&i!=="Unknown",P=`
    <div class="video-card__play-overlay">
      <div class="video-card__play-btn" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.14v14l11-7-11-7z"/>
        </svg>
      </div>
    </div>`,D=b!=null?`
    <button
      type="button"
      class="video-card__favorite${u?" video-card__favorite--active":""}"
      data-favorite-toggle
      data-video-id="${Ne(O)}"
      aria-pressed="${u?"true":"false"}"
      aria-label="${Ne(u?`Remove ${y} from favorites`:`Add ${y} to favorites`)}">
      <svg class="video-card__favorite-icon video-card__favorite-icon--off" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 17.5l-5.5 3 1.5-6.5L3 9.5l6.8-1L12 3l2.2 5.5 6.8 1-5 4.5 1.5 6.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <svg class="video-card__favorite-icon video-card__favorite-icon--on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 17.5l-5.5 3 1.5-6.5L3 9.5l6.8-1L12 3l2.2 5.5 6.8 1-5 4.5 1.5 6.5z"/>
      </svg>
    </button>`:"",Kt=a?`<img
         class="video-card__image"
         src="${a}"
         alt="${(e||"Video").replace(/"/g,"&quot;")} thumbnail"
         loading="lazy"
         decoding="async"
       />`:`<div class="video-card__placeholder" aria-hidden="true">
         <svg class="video-card__placeholder-icon" viewBox="0 0 24 24" fill="none">
           <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
           <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
         </svg>
       </div>`,Xt=ie?`<span class="video-card__duration"><span class="badge badge-duration">${o}</span></span>`:"",Zt=s>0?`<div
         class="progress-bar"
         role="progressbar"
         aria-valuenow="${s}"
         aria-valuemin="0"
         aria-valuemax="100"
         aria-label="Progress ${s}%">
         <div class="progress-bar__fill" style="width:${s}%"></div>
       </div>`:"",Ie=R?`<span class="badge badge-pill">${R}</span>`:"",Be=c?'<span class="badge badge-new">New</span>':"",Me=S?`<span class="badge badge-resolution">${i}</span>`:"";return`
<article
  class="video-card${m}${V}"
  ${v}
  tabindex="0"
  role="button"
  aria-label="Play ${(e||"video").replace(/"/g,"&quot;")}">
  <div class="video-card__thumbnail">
    ${Kt}
    ${P}
    ${D}
    ${Xt}
    ${Zt}
  </div>
  <div class="video-card__body">
    ${Ie||Be?`
    <div class="video-card__meta">
      ${Ie}
      ${Be}
    </div>`:""}
    <h4 class="video-card__title">${y}</h4>
    ${X?`<p class="video-card__description">${X}</p>`:""}
    ${Me?`<div class="video-card__footer">${Me}</div>`:""}
  </div>
</article>`.trim()}function ae({title:e,subtitle:t,count:r,accent:n,href:o=""}){let a=`
    <div class="subject-card__cover" aria-hidden="true"
         style="background: ${`linear-gradient(
    135deg,
    ${n}55 0%,
    ${n}22 40%,
    rgba(15, 21, 32, 0.6) 100%
  )`};"></div>
    <div class="subject-card__scrim" aria-hidden="true"></div>
    <div class="subject-card__content">
      <h4>${e}</h4>
      <p>${r} video${r!==1?"s":""}</p>
    </div>
  `;return o?`<a class="subject-card" href="${o}" aria-label="Browse ${e}">${a}</a>`:`<article class="subject-card">${a}</article>`}function _({title:e,message:t,action:r=""}){return`
<section class="empty-state" role="status" aria-live="polite">
  <div class="empty-state__illustration" aria-hidden="true">
    ${or(e)}
  </div>
  <div class="empty-state__content">
    <h3>${e}</h3>
    <p>${t}</p>
    ${r?`<div class="empty-state__action">${r}</div>`:""}
  </div>
</section>`.trim()}function or(e){let t=(e||"").toLowerCase();return t.includes("search")||t.includes("matching")||t.includes("found")?ar():t.includes("histor")||t.includes("watch")?sr():t.includes("favorit")||t.includes("saved")?lr():t.includes("video")||t.includes("library")||t.includes("loaded")?ir():cr()}function ir(){return`<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Film strip body -->
    <rect x="12" y="24" width="72" height="48" rx="6" stroke="currentColor" stroke-width="3"/>
    <!-- Sprocket holes left -->
    <rect x="12" y="32" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="44" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="56" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <!-- Sprocket holes right -->
    <rect x="76" y="32" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="76" y="44" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="76" y="56" width="8" height="8" rx="2" fill="currentColor" opacity="0.5"/>
    <!-- Play triangle -->
    <path d="M38 36l22 12-22 12V36z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`}function ar(){return`<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Magnifier circle -->
    <circle cx="40" cy="40" r="22" stroke="currentColor" stroke-width="3"/>
    <!-- Magnifier handle -->
    <line x1="56" y1="56" x2="76" y2="76" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- X lines inside -->
    <line x1="32" y1="32" x2="48" y2="48" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <line x1="48" y1="32" x2="32" y2="48" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </svg>`}function sr(){return`<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Clock circle -->
    <circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="3"/>
    <!-- Clock hands -->
    <line x1="50" y1="50" x2="50" y2="30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="64" y2="58" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- Center dot -->
    <circle cx="50" cy="50" r="3" fill="currentColor"/>
    <!-- History arrow (counter-clockwise arc suggestion) -->
    <path d="M22 50 A28 28 0 0 1 36 26" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-dasharray="5 4" opacity="0.5"/>
    <polyline points="18,44 22,50 28,46" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
  </svg>`}function lr(){return`<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Large star -->
    <path d="M48 14l8.5 17.2 19 2.8-13.7 13.4 3.2 18.8L48 57l-17 8.9 3.2-18.8L20.5 34l19-2.8L48 14z"
          stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <!-- Small decorative stars -->
    <path d="M18 22l1.5 3 3.3.5-2.4 2.3.6 3.3L18 29.5 15 31.1l.6-3.3-2.4-2.3 3.3-.5L18 22z"
          stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity="0.4"/>
    <path d="M76 62l1.2 2.4 2.7.4-1.9 1.9.4 2.6L76 68l-2.4 1.3.4-2.6-1.9-1.9 2.7-.4L76 62z"
          stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" opacity="0.4"/>
  </svg>`}function cr(){return`<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Open box / folder -->
    <path d="M16 36h64l-6 36H22L16 36z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <path d="M12 36l4-12h22l6 8h28l4 4" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Dotted line inside suggesting emptiness -->
    <line x1="32" y1="56" x2="64" y2="56" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-dasharray="5 5" opacity="0.4"/>
  </svg>`}var Ue=[{key:"under-10",label:"<10 min",min:0,max:600},{key:"10-30",label:"10\u201330 min",min:600,max:1800},{key:"30-60",label:"30\u201360 min",min:1800,max:3600},{key:"60-plus",label:"60+ min",min:3600,max:1/0}],De=[{value:"relevance",label:"Relevance"},{value:"title",label:"Title"},{value:"duration",label:"Duration"},{value:"newest",label:"Newest"},{value:"oldest",label:"Oldest"},{value:"resolution",label:"Resolution"},{value:"subject",label:"Subject"}],f={filters:{subject:"All",resolution:"All",duration:"All",fileType:"All"},sort:{by:"relevance",order:"desc"},selectedIndex:0,history:[]};function C(e=""){return String(e).trim().toLowerCase()}function re(e=""){return C(String(e).replace(/\s+/g," ")).trim()}function se(e=""){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ze(e={}){let r=String(e.relative_path||e.filename||"").split(".");return r.length<2?"Unknown":r.pop().toLowerCase()}function we(e={}){let t=e.duration??e.duration_formatted??"";if(typeof t=="number"&&Number.isFinite(t))return Math.max(0,t);let r=String(t).trim();if(!r)return 0;let n=r.split(":").map(o=>Number(o));if(n.some(o=>Number.isNaN(o))){let o=Number(String(r).replace(/[^0-9]/g,""));return Number.isFinite(o)?o:0}return n.length===3?n[0]*3600+n[1]*60+n[2]:n.length===2?n[0]*60+n[1]:n[0]||0}function W(e={}){let t=e.resolution;if(typeof t=="string"&&t.trim())return t.trim();if(t&&typeof t=="object"){let r=Number(t.width)||0,n=Number(t.height)||0;if(r>0&&n>0)return`${n}p`}return"Unknown"}function qe(e){let t=we(e),r=Ue.find(n=>t>=n.min&&t<n.max);return r?r.label:"Unknown"}function dr(e){return re(e).split(" ").filter(Boolean)}function Ye(e,t){let r=0,n=0;for(;r<e.length&&n<t.length;)e[r]===t[n]&&(r+=1),n+=1;return r===e.length}function te(e="",t=""){let r=C(e),n=re(t);return!r||!n?0:r===n?1:r.startsWith(n)?.92:r.split(/\s+/).some(i=>i.startsWith(n))?.82:r.includes(n)?.7:Ye(n,r)?.45+Math.min(.25,n.length/Math.max(8,r.length)):0}function ur(e,t){let r=C(e),n=dr(t);if(!n.length||!r)return[];let o=[];for(let a of n){let s=0;for(;s<r.length;){let c=r.indexOf(a,s);if(c===-1)break;o.push({start:c,end:c+a.length}),s=c+a.length}}if(!o.length)return[];o.sort((a,s)=>a.start-s.start);let i=[o[0]];for(let a=1;a<o.length;a+=1){let s=o[a],c=i[i.length-1];s.start<=c.end?c.end=Math.max(c.end,s.end):i.push(s)}return i}function $e(e,t){let r=String(e),n=ur(r,t);if(!n.length)return se(r);let o="",i=0;return n.forEach(a=>{o+=se(r.slice(i,a.start)),o+=`<mark>${se(r.slice(a.start,a.end))}</mark>`,i=a.end}),o+=se(r.slice(i)),o}function Je(e,t){let r=re(t);if(!r)return 0;let n=te(e.title,r)*1200,o=te(e.subject,r)*600,i=te(e.filename,r)*350,a=te(e.description,r)*250,s=te(Array.isArray(e.tags)?e.tags.join(" "):e.tags,r)*300,c=C(e.title)===r,p=C(e.subject)===r;return n+o+i+a+s+(c?280:0)+(p?140:0)}function Qe(e,t){let r=re(t);return r?[e.title,e.subject,e.filename,e.description,Array.isArray(e.tags)?e.tags.join(" "):e.tags].filter(Boolean).some(n=>C(n).includes(r)||Ye(r,C(n))):!0}function We(e,t){return e.filter(r=>!(t.subject&&t.subject!=="All"&&C(r.subject)!==C(t.subject)||t.resolution&&t.resolution!=="All"&&W(r)!==t.resolution||t.duration&&t.duration!=="All"&&qe(r)!==t.duration||t.fileType&&t.fileType!=="All"&&ze(r)!==t.fileType.toLowerCase()))}function pr(e,t){let r=t.order==="asc"?1:-1;return[...e].sort((n,o)=>{if(t.by==="relevance")return r*(o.score-n.score)||r*(o.score-n.score);if(t.by==="title")return r*String(n.video.title||"").localeCompare(String(o.video.title||""),void 0,{numeric:!0,sensitivity:"base"});if(t.by==="duration")return r*(we(n.video)-we(o.video));if(t.by==="newest"||t.by==="oldest"){let i=Date.parse(n.video.created_time||n.video.last_modified||"")||0,a=Date.parse(o.video.created_time||o.video.last_modified||"")||0;return(t.by==="newest"?-1:1)*(i-a)*r}if(t.by==="resolution"){let i=Number(String(W(n.video)).replace(/[^0-9]/g,""))||0,a=Number(String(W(o.video)).replace(/[^0-9]/g,""))||0;return r*(i-a)}return t.by==="subject"?r*String(n.video.subject||"").localeCompare(String(o.video.subject||""),void 0,{sensitivity:"base"}):0})}function Ge(){return De}function ne(){return{filters:{...f.filters},sort:{...f.sort},selectedIndex:f.selectedIndex,history:[...f.history]}}function G(e,t){Object.prototype.hasOwnProperty.call(f.filters,e)&&(f.filters[e]=t||"All",f.selectedIndex=0,w({}))}function Ke(e,t){f.sort.by=e||"relevance",f.sort.order=t==="asc"?"asc":"desc",f.selectedIndex=0,w({})}function xe(e){f.selectedIndex=Number.isFinite(e)?e:0,w({})}function le(){f.selectedIndex=0}function Xe(e){let t=re(e);if(!t)return;let r=f.history.findIndex(n=>n===t);r!==-1&&f.history.splice(r,1),f.history.unshift(t),f.history.length>10&&(f.history.length=10)}function Ze(){return[...f.history]}function et(e=[]){let t=new Set,r=new Set,n=new Set,o=new Set;return e.forEach(i=>{i.subject&&t.add(i.subject);let a=W(i);a&&r.add(a);let s=qe(i);s&&n.add(s);let c=ze(i);c&&c!=="Unknown"&&o.add(c)}),{subjects:["All",...Array.from(t).sort((i,a)=>i.localeCompare(a,void 0,{sensitivity:"base"}))],resolutions:["All",...Array.from(r).sort((i,a)=>i.localeCompare(a,void 0,{sensitivity:"base"}))],durations:["All",...Ue.map(i=>i.label).filter((i,a,s)=>s.indexOf(i)===a)],fileTypes:["All",...Array.from(o).sort()]}}function ce(e=[],t=""){if(!Array.isArray(e))return[];let r={...f.filters},n={...f.sort},i=We(e,r).filter(a=>Qe(a,t)).map(a=>({video:a,score:Je(a,t),highlight:{title:$e(a.title||a.filename||"Untitled video",t),description:$e(a.description||a.filename||"",t),subject:$e(a.subject||"",t)}}));return pr(i,n)}function tt(e=[],t=""){let n=We(e,f.filters).filter(a=>Qe(a,t)),o=new Set(e.map(a=>C(a.subject)).filter(Boolean)),i=Object.entries(f.filters).filter(([,a])=>a&&a!=="All");return{totalVideos:e.length,totalSubjects:o.size,filteredVideos:n.length,activeFilters:i.map(([a,s])=>({key:a,value:s})),sortLabel:De.find(a=>a.value===f.sort.by)?.label||"Relevance",sortOrder:f.sort.order,selectedIndex:f.selectedIndex}}function rt(e,t=[],r=4){return!e||!Array.isArray(t)||t.length===0?[]:t.filter(o=>String(o.id)!==String(e.id)).map(o=>{let i=C(o.subject)===C(e.subject)?150:0,a=W(o)===W(e)?50:0,s=C(o.filename||"")===C(e.filename||"")?30:0;return{video:o,score:Je(o,e.title||"")+i+a+s}}).sort((o,i)=>i.score-o.score).slice(0,r).map(o=>o.video)}function je(e=[],t=4){return[...e].sort((r,n)=>{let o=Date.parse(r.created_time||r.last_modified||"")||0;return(Date.parse(n.created_time||n.last_modified||"")||0)-o}).slice(0,t)}function nt(e=[],t=5){let r=e.reduce((n,o)=>{let i=o.subject||"Unknown";return n[i]=(n[i]||0)+1,n},{});return Object.entries(r).map(([n,o])=>({subject:n,count:o})).sort((n,o)=>o.count-n.count||n.subject.localeCompare(o.subject,void 0,{sensitivity:"base"})).slice(0,t)}function ot(e=[],t){return t?e.filter(r=>C(r.subject)===C(t)):[]}function it(e=[],t=6){return[...e].slice(0,t)}function at(e){return e==="subject"?"Subject":e==="resolution"?"Resolution":e==="duration"?"Duration":e==="fileType"?"File Type":e}function st(){return{...f.filters}}function lt(){return{...f.sort}}function ct(){w({searchQuery:""}),f.selectedIndex=0}var dt=["#70b4ff","#9bd57e","#ffb86c","#8f94ff","#69d4c6","#ff8fc7"];function fr(e){return dt[e%dt.length]}function ut(e){return I({title:e.title,subject:e.subject,duration:L(e),resolution:A(e),thumbnail:T(e),description:e.display_title||e.filename,videoId:e.id})}function pt(){let e=Fe(),t=F(),r=x(),n=je(r,12),o=it(r,12),i=je(r,3),a=[{label:"Subjects",value:String(e.totalSubjects),helper:"Topic collections"},{label:"Videos",value:String(e.totalVideos),helper:"Available videos"},{label:"Recent",value:String(n.length),helper:"Recently added"},{label:"Activity",value:String(i.length),helper:"Latest additions"}];return`
    <section class="page-view" aria-label="Library home">

      <!-- Recently Added shelf -->
      <div class="media-section">
        ${j({title:"Recently Added",subtitle:n.length?`${n.length} video${n.length!==1?"s":""}`:""})}
        ${n.length?`<div class="media-shelf">${n.map(ut).join("")}</div>`:_({title:"No videos yet",message:"Your library has no videos yet."})}
      </div>

      <!-- Featured shelf -->
      ${o.length?`
        <div class="media-section">
          ${j({title:"From the Library",subtitle:"All available videos"})}
          <div class="media-shelf">${o.map(ut).join("")}</div>
        </div>
      `:""}

      <!-- Subjects grid -->
      <div class="media-section">
        ${j({title:"Subjects",subtitle:`${t.length} collection${t.length!==1?"s":""}`})}
        ${t.length?`<div class="subject-grid">
              ${t.map((s,c)=>{let p=q(s),d=s.video_count??s.videos?.length??0;return ae({title:s.name,subtitle:`${d} video${d!==1?"s":""}`,count:d,accent:fr(c),href:`#${l.SUBJECT}/${p}`})}).join("")}
            </div>`:_({title:"No subjects found",message:"The library has no subjects."})}
      </div>

      <!-- Stats \u2014 secondary, below the content -->
      <div class="media-section">
        ${j({title:"Library Stats"})}
        <div class="stats-grid">
          ${a.map(s=>B(s)).join("")}
        </div>
      </div>

    </section>
  `}function M({eyebrow:e,title:t,description:r,action:n}){return`
  <div class="page-header">
    <div>
      <span class="eyebrow">${e}</span>
      <h2 class="page-title">${t}</h2>
      <p class="page-copy">${r}</p>
    </div>
    ${n?`<div class="page-header-action">${n}</div>`:""}
  </div>
  `}function $(e,t,r,n){return e.addEventListener(t,r,n),()=>e.removeEventListener(t,r,n)}function de(e,t=180){let r;return(...n)=>{window.clearTimeout(r),r=window.setTimeout(()=>e(...n),t)}}var ft=["#70b4ff","#9bd57e","#ffb86c","#8f94ff","#69d4c6","#ff8fc7"];function br(e){return ft[e%ft.length]}var Y=null;function bt(e,t){Y&&(Y(),Y=null);let r=e.querySelector("#subject-search-input"),n=e.querySelector("#subject-video-grid"),o=e.querySelector("[data-subject-count]");if(!r||!n)return;let i=Array.from(n.querySelectorAll(".video-card")),a=de(d=>{let b=d.trim().toLowerCase(),h=0;i.forEach(k=>{let v=(k.textContent||"").toLowerCase(),m=!b||v.includes(b);k.style.display=m?"":"none",m&&(h+=1)}),o&&(o.textContent=b?`${h} of ${i.length} videos`:`${i.length} videos`)},150),s=d=>a(d.target.value),c=d=>{d.key==="Escape"&&(r.value="",a(""))},p=[$(r,"input",s),$(r,"keydown",c)];Y=()=>p.forEach(d=>d()),r.focus()}function gt(){Y&&(Y(),Y=null)}function gr(e){return I({title:e.title,subject:e.subject,duration:L(e),resolution:A(e),thumbnail:T(e),description:e.display_title||e.filename,videoId:e.id})}function ht(e={}){let t=F(),r=e.subjectSlug||null,n=r?ee(r):null,o=x(),i=n?ot(o,n.name):[],a=!!n,s=!!(r&&!n),c=s?"Subject not found":a?n.name:"Subjects",p=s?`No subject matching "${r}" was found in the library.`:a?`${i.length} video${i.length!==1?"s":""} in this collection.`:"Browse topic collections in your library.";if(s)return`
      <section class="page-view" aria-labelledby="subject-title">
        ${M({eyebrow:"Subjects",title:"Subject not found",description:p})}
        <section class="panel">
          ${_({title:"Subject not found",message:`No subject matching "${r}" exists in the loaded library.`,action:`<a href="#${l.SUBJECT}" class="button">Browse subjects</a>`})}
        </section>
      </section>
    `;if(a)return`
      <section class="page-view" aria-labelledby="subject-title">
        ${M({eyebrow:"Subjects",title:n.name,description:`${i.length} video${i.length!==1?"s":""} in this collection.`})}

        <section class="panel">
          <div class="subject-search-bar">
            <div class="search-box">
              <label class="search-box__label" for="subject-search-input">
                <span class="visually-hidden">Filter videos in ${n.name}</span>
                <input
                  id="subject-search-input"
                  class="search-box__input"
                  type="search"
                  placeholder="Filter videos\u2026"
                  autocomplete="off"
                  aria-label="Filter videos in ${n.name}"
                />
              </label>
            </div>
            <span class="card-meta" data-subject-count>${i.length} videos</span>
          </div>

          ${j({title:n.name,subtitle:""})}
          <div class="card-grid" id="subject-video-grid">
            ${i.length?i.map(gr).join(""):_({title:"No videos found",message:`There are no videos in the ${n.name} collection.`})}
          </div>
        </section>
      </section>
    `;let d=nt(o,100),b=Object.fromEntries(d.map(h=>[h.subject,h.count]));return`
    <section class="page-view" aria-labelledby="subject-title">
      ${M({eyebrow:"Subjects",title:"Subjects",description:"Browse topic collections in your library."})}

      <div class="subject-grid">
        ${t.length?t.map((h,k)=>{let v=q(h),m=b[h.name]??Q(h.name).length;return ae({title:h.name,subtitle:`${m} video${m!==1?"s":""}`,count:m,accent:br(k),href:`#${l.SUBJECT}/${v}`})}).join(""):_({title:"No subjects available",message:"The library has not indexed any subjects yet.",action:`<a href="#${l.HOME}" class="button">Return to library</a>`})}
      </div>
    </section>
  `}var hr={mp4:"video/mp4",webm:"video/webm",ogg:"video/ogg",mov:"video/quicktime",avi:"video/x-msvideo",mkv:"video/x-matroska"},mr=[".vtt",".srt"];function mt(e){if(!e)return null;let t=String(e).replace(/^\/+/,"");return`../${encodeURI(t)}`}function yt(e){return!e||!e.relative_path?null:mt(e.relative_path)}function vt(e){if(!e||!e.relative_path)return"video/mp4";let t=String(e.relative_path).split(".").pop().toLowerCase();return hr[t]||"video/mp4"}function yr(e){if(!e||!e.relative_path)return[];let t=String(e.relative_path).replace(/\.[^/.]+$/,"");return mr.map(r=>({url:mt(`${t}${r}`),extension:r}))}async function vr(e){if(!e)return!1;try{return(await fetch(e,{method:"HEAD",cache:"no-store"})).ok}catch{return!1}}async function St(e){let t=yr(e),r=[];return await Promise.all(t.map(async n=>{!n.url||!await vr(n.url)||r.push({src:n.url,kind:"subtitles",srclang:(n.extension===".srt","en"),label:(n.extension===".vtt","Subtitles")})})),r}var Sr=[.5,.75,1,1.25,1.5,2],ue=null;function $r(){return Sr.map(e=>`
    <option value="${e}"${e===1?" selected":""}>${e}\xD7</option>
  `).join("")}function $t(e,t,r){return Math.min(r,Math.max(t,e))}function wr(e){if(!e)return!1;let t=e.tagName?.toLowerCase();return t==="input"||t==="textarea"||t==="select"||e.isContentEditable}function H(e,t){let{overlay:r,overlayMessage:n,replayButton:o}=e;if(r.classList.remove("player-overlay--loading","player-overlay--buffering","player-overlay--ended","player-overlay--error","player-overlay--hidden"),o.classList.add("hidden"),t==="hidden"){r.classList.add("player-overlay--hidden");return}if(r.classList.remove("player-overlay--hidden"),t==="loading"){r.classList.add("player-overlay--loading"),n.textContent="Loading video\u2026";return}if(t==="buffering"){r.classList.add("player-overlay--buffering"),n.textContent="Buffering\u2026";return}if(t==="ended"){r.classList.add("player-overlay--ended"),n.textContent="Playback ended.",o.classList.remove("hidden");return}if(t==="error"){r.classList.add("player-overlay--error"),n.textContent="Playback failed. Please try another video.";return}}function ke(){if(!ue)return;let{videoElement:e,eventListeners:t,keyboardListener:r}=ue;t.forEach(({target:n,type:o,listener:i,options:a})=>{n.removeEventListener(o,i,a)}),r&&document.removeEventListener("keydown",r),e&&(e.pause(),e.removeAttribute("src"),e.load()),ue=null}function xr(e){ke();let t=e.querySelector("#video-player"),r=e.querySelector("[data-player-overlay]"),n=e.querySelector("[data-player-overlay-message]"),o=e.querySelector("[data-player-replay]"),i=e.querySelector("[data-player-speed]"),a=e.querySelector("[data-player-prev]"),s=e.querySelector("[data-player-next]");if(!t||!r||!n||!o||!i)return null;let c={container:e,videoElement:t,overlay:r,overlayMessage:n,replayButton:o,speedSelect:i,prevButton:a,nextButton:s,eventListeners:[],keyboardListener:null};return ue=c,c}function jr(e,t,r,n){let{videoElement:o,replayButton:i,speedSelect:a,prevButton:s,nextButton:c}=e,p=()=>H(e,"hidden"),d=()=>H(e,"hidden"),b=()=>H(e,"hidden"),h=()=>{o.currentTime>0&&!o.ended&&H(e,"hidden")},k=()=>H(e,"buffering"),v=()=>H(e,"ended"),m=()=>H(e,"error"),V=()=>{o.currentTime=0,o.play().catch(()=>H(e,"error"))},O=S=>{let P=Number(S.target.value)||1;o.playbackRate=P},u=S=>{S&&N(`${l.PLAYER}/${encodeURIComponent(S.id)}`)},y=()=>u(r),R=()=>u(n),X=S=>{if(e.container.contains(document.activeElement)&&!wr(document.activeElement))switch(S.key){case" ":case"Spacebar":S.preventDefault(),o.paused?o.play().catch(()=>H(e,"error")):o.pause();break;case"ArrowLeft":S.preventDefault(),o.currentTime=Math.max(0,o.currentTime-5);break;case"ArrowRight":S.preventDefault(),o.currentTime=Math.min(o.duration||1/0,o.currentTime+5);break;case"ArrowUp":S.preventDefault(),o.volume=$t(o.volume+.1,0,1);break;case"ArrowDown":S.preventDefault(),o.volume=$t(o.volume-.1,0,1);break;case"m":case"M":S.preventDefault(),o.muted=!o.muted;break;case"f":case"F":S.preventDefault(),document.fullscreenElement?document.exitFullscreen().catch(()=>{}):e.container.requestFullscreen().catch(()=>{});break;case"Escape":document.fullscreenElement&&(S.preventDefault(),document.exitFullscreen().catch(()=>{}));break;default:break}},ie=()=>{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});return}e.container.requestFullscreen().catch(()=>{})};o.addEventListener("loadedmetadata",p),o.addEventListener("canplay",d),o.addEventListener("play",b),o.addEventListener("pause",h),o.addEventListener("waiting",k),o.addEventListener("ended",v),o.addEventListener("error",m),o.addEventListener("dblclick",ie),i.addEventListener("click",V),a.addEventListener("change",O),s&&s.addEventListener("click",y),c&&c.addEventListener("click",R),document.addEventListener("keydown",X),e.eventListeners.push({target:o,type:"loadedmetadata",listener:p},{target:o,type:"canplay",listener:d},{target:o,type:"play",listener:b},{target:o,type:"pause",listener:h},{target:o,type:"waiting",listener:k},{target:o,type:"ended",listener:v},{target:o,type:"error",listener:m},{target:o,type:"dblclick",listener:ie},{target:i,type:"click",listener:V},{target:a,type:"change",listener:O}),s&&e.eventListeners.push({target:s,type:"click",listener:y}),c&&e.eventListeners.push({target:c,type:"click",listener:R}),e.keyboardListener=X,H(e,"loading"),t&&St(t).then(S=>{S.forEach(P=>{let D=document.createElement("track");D.kind=P.kind,D.label=P.label,D.srclang=P.srclang,D.src=P.src,o.appendChild(D)})}).catch(()=>{})}function Ee(){ke()}function wt(e){if(!e){ke();return}let t=xr(e);if(!t)return;let r=t.videoElement.dataset.videoId||null,n=t.prevButton?.dataset.videoId||null,o=t.nextButton?.dataset.videoId||null,i=r?z(r):null,a=n?z(n):null,s=o?z(o):null;jr(t,i,a,s);let c=e.querySelector("[data-player-desc]"),p=e.querySelector("[data-player-desc-toggle]");if(c&&p){let d=!1,b=()=>{d=!d,c.dataset.expanded=String(d),p.setAttribute("aria-expanded",String(d))};p.addEventListener("click",b),t.eventListeners.push({target:p,type:"click",listener:b})}}function xt(e={}){let t=e.videoId||null,r=t?z(t):null,n=!!(t&&!r);if(!t)return`
      <section class="page-view" aria-labelledby="player-title">
        ${_({title:"No video selected",message:"Choose a video from the library to begin playback.",action:`<a href="#${l.HOME}" class="button">Browse library</a>`})}
      </section>
    `;if(n)return`
      <section class="page-view" aria-labelledby="player-title">
        ${_({title:"Video not found",message:`The video ID "${t}" does not exist in the loaded library.`,action:`<a href="#${l.HOME}" class="button">Browse library</a>`})}
      </section>
    `;let o=Q(r.subject),i=o.findIndex(u=>String(u.id)===String(r.id)),a=i>0?o[i-1]:null,s=i>=0&&i<o.length-1?o[i+1]:null,c=rt(r,x(),8),p=yt(r),d=T(r)||"",b=r.description||r.display_title||r.filename||"",h=s?`
    <div class="player-upnext">
      <p class="player-upnext__label">Up Next</p>
      ${I({title:s.title,subject:s.subject,duration:L(s),resolution:A(s),thumbnail:T(s),videoId:s.id,layout:"list"})}
    </div>
  `:"",k=c.filter(u=>!s||String(u.id)!==String(s.id)),v=k.length?`
    <div class="player-related">
      <p class="player-related__label">Related</p>
      <div class="player-related__list">
        ${k.map(u=>I({title:u.title,subject:u.subject,duration:L(u),resolution:A(u),thumbnail:T(u),videoId:u.id,layout:"list",selected:String(u.id)===String(r.id)})).join("")}
      </div>
    </div>
  `:"",m=L(r),V=A(r),O=[`<span class="badge badge-pill">${r.subject}</span>`,m!=="Unknown"?`<span class="badge badge-duration">${m}</span>`:"",V!=="Unknown"?`<span class="badge badge-resolution">${V}</span>`:""].filter(Boolean).join("");return`
    <section class="page-view" aria-labelledby="player-title">

      <div class="player-shell" data-player-shell tabindex="0">

        <!-- \u2500\u2500 Primary: video + info \u2500\u2500 -->
        <div class="player-primary">

          <!-- Video -->
          <div class="player-video-wrapper">
            <video
              id="video-player"
              data-video-id="${r.id}"
              class="player-video"
              controls
              preload="metadata"
              playsinline
              controlslist="nodownload noremoteplayback"
              poster="${d}"
              aria-label="Video player for ${r.title.replace(/"/g,"&quot;")}"
            >
              <source src="${p||""}" type="${vt(r)}" />
              <p>Your browser does not support HTML5 video playback.</p>
            </video>
            <div class="player-overlay player-overlay--hidden" data-player-overlay>
              <p class="player-overlay__message" data-player-overlay-message>Loading video\u2026</p>
              <button type="button" class="button button-primary hidden" data-player-replay>Replay</button>
            </div>
          </div>

          <!-- Title + toolbar -->
          <div class="player-info">
            <h1 id="player-title" class="player-title">${r.title}</h1>
            <div class="player-toolbar">
              <div class="player-toolbar__nav">
                <button
                  type="button"
                  class="player-nav-btn player-nav-btn--prev"
                  data-player-prev
                  data-video-id="${a?.id??""}"
                  ${a?"":"disabled"}
                  aria-label="Previous video${a?`: ${a.title}`:""}"
                >Prev</button>
                <button
                  type="button"
                  class="player-nav-btn player-nav-btn--next"
                  data-player-next
                  data-video-id="${s?.id??""}"
                  ${s?"":"disabled"}
                  aria-label="Next video${s?`: ${s.title}`:""}"
                >Next</button>
              </div>
              <div class="player-speed">
                <label for="player-speed-select" class="player-speed__label">Speed</label>
                <select
                  id="player-speed-select"
                  class="player-speed__select"
                  data-player-speed
                  aria-label="Playback speed"
                >${$r()}</select>
              </div>
            </div>
          </div>

          <!-- Meta strip -->
          <div class="player-meta-strip" aria-label="Video metadata">
            ${O}
          </div>

          <!-- Description -->
          ${b?`
          <div class="player-desc" data-player-desc>
            <button
              type="button"
              class="player-desc__toggle"
              data-player-desc-toggle
              aria-expanded="false"
              aria-controls="player-desc-body"
            >
              Description
              <svg class="player-desc__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="player-desc__body" id="player-desc-body" role="region" aria-label="Description">
              <div class="player-desc__inner">
                <p class="player-desc__text">${b.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
              </div>
            </div>
          </div>
          `:""}

        </div><!-- /.player-primary -->

        <!-- \u2500\u2500 Sidebar: Up Next + Related \u2500\u2500 -->
        <aside class="player-sidebar" aria-label="Up next and related videos">
          ${h}
          ${v}
        </aside>

      </div><!-- /.player-shell -->

    </section>
  `}function kr(){let{favorites:e}=g(),t=x();if(!Array.isArray(e)||!e.length||!t.length)return[];let r=new Map(t.map(o=>[String(o.id),o])),n=new Set;return e.map(o=>o&&typeof o=="object"&&o.id!=null?o:r.get(String(o))??null).filter(o=>{if(!o||o.id==null)return!1;let i=String(o.id);return n.has(i)?!1:(n.add(i),!0)})}function Er(e){return I({title:e.title,subject:e.subject,duration:L(e),resolution:A(e),thumbnail:T(e),description:e.display_title||e.filename,videoId:e.id})}function jt(){let e=kr(),t=e.length,r=new Set(e.map(n=>n.subject)).size;return`
    <section class="page-view" aria-labelledby="favorites-title">
      ${M({eyebrow:"Favorites",title:"Favorites",description:t?`${t} saved video${t!==1?"s":""} organized for quick access.`:"Videos you mark as favorites will appear here for quick access."})}

      ${t?`
          <div class="media-section">
            ${j({title:"Saved videos",subtitle:`${t} item${t!==1?"s":""}`})}
            <div class="stats-grid">
              ${B({label:"Saved",value:String(t),helper:"Ready to open offline"})}
              ${B({label:"Subjects",value:String(r),helper:"Across your favorites"})}
            </div>
          </div>

          <div class="media-section">
            ${j({title:"Your collection",subtitle:"Ordered by how you saved them"})}
            <div class="card-grid">
              ${e.map(Er).join("")}
            </div>
          </div>
        `:_({title:"No favorites yet",message:"Mark videos as favorites to keep them handy for later.",action:`<a href="#${l.HOME}" class="button">Browse library</a>`})}
    </section>
  `}function _r(e=""){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Cr(e){if(!Number.isFinite(e)||e<=0)return"";let t=Math.round(e);if(t<60)return`${t}s`;let r=Math.floor(t/3600),n=Math.floor(t%3600/60);return r>0?`${r}h ${n}m`:`${n}m`}function Lr(e){let t=L(e);if(!t||t==="Unknown")return 0;let r=String(t).trim().toLowerCase(),n=r.match(/^(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?$/);if(n&&(n[1]||n[2]||n[3])){let i=Number(n[1]||0),a=Number(n[2]||0),s=Number(n[3]||0);return i*3600+a*60+s}let o=r.split(":").map(i=>Number(i));if(o.every(i=>Number.isFinite(i))){if(o.length===3)return o[0]*3600+o[1]*60+o[2];if(o.length===2)return o[0]*60+o[1]}return 0}function Tr(e){if(!e)return"Recently watched";if(typeof e=="string")return e;let t=new Date(e);return Number.isNaN(t.getTime())?String(e):new Intl.DateTimeFormat(void 0,{month:"short",day:"numeric",year:t.getFullYear()!==new Date().getFullYear()?"numeric":void 0}).format(t)}function Ar(){let e=g(),t=Array.isArray(e.history)?e.history:[],r=Array.isArray(e.continueWatching)?e.continueWatching:[];return[...t,...r]}function Rr(){let e=x(),t=new Map(e.map(n=>[String(n.id),n])),r=new Set;return Ar().map((n,o)=>{let i=n&&typeof n=="object"?n:null,a=i?.videoId??i?.id??i?.video_id??null,s=a!=null?t.get(String(a))??null:null,c=s?.title||i?.title||"Untitled",p=s?.subject||i?.subject||"",d=Number(i?.progress??i?.watchProgress??i?.watchedPercent??i?.percent??0),b=Number.isFinite(d)?Math.max(0,Math.min(100,d)):0,h=Tr(i?.watchedAt||i?.lastWatched||i?.timestamp||i?.time||i?.updatedAt),k=!!(i?.completed||b>=99.5),v=Number(i?.watchTimeSeconds??i?.watchedSeconds??i?.progressSeconds??(b&&s?b/100*Lr(s):0)),m=String(a??`${c}-${h}-${o}`);return r.has(m)?null:(r.add(m),{key:m,video:s,title:c,subject:p,videoId:a,watchedLabel:h,progress:b,completed:k,watchSeconds:Number.isFinite(v)?Math.max(0,v):0,note:i?.note||i?.description||i?.time||""})}).filter(Boolean)}function Ir(e){let t=I({title:e.title,subject:e.subject,duration:e.video?L(e.video):"Unknown",resolution:e.video?A(e.video):"Unknown",thumbnail:e.video?T(e.video):null,description:e.video?.display_title||e.video?.filename||e.note||"Previously watched video",videoId:e.videoId,progress:e.progress}),r=e.completed?'<span class="badge badge-new">Completed</span>':e.progress>0?`<span class="badge badge-pill">${Math.round(e.progress)}% watched</span>`:"";return`
    <article class="history-item">
      ${t}
      <div class="history-item__meta">
        <span class="badge badge-pill">Last watched ${_r(e.watchedLabel)}</span>
        ${r}
      </div>
    </article>
  `}function Br(e){let t=e.reduce((n,o)=>n+(o.watchSeconds||0),0);return Cr(t)||"Not tracked"}function kt(){let e=Rr(),t=e.slice(0,3).map(o=>o.title),r=e.length,n=Br(e);return`
    <section class="page-view" aria-labelledby="history-title">
      ${M({eyebrow:"History",title:"Watch History",description:r?"Everything you have watched, ordered by the most recent activity.":"Everything you have watched will appear here once playback starts."})}

      ${e.length?`
          <section class="media-section">
            ${j({title:"Overview",subtitle:`${r} watched video${r!==1?"s":""}`})}
            <div class="stats-grid history-stats-grid">
              ${B({label:"Watched",value:String(r),helper:"Saved locally in your watch history"})}
              ${B({label:"Watch time",value:n,helper:n==="Not tracked"?"Progress data not available yet":"Approximate total playback time"})}
              ${B({label:"Recent",value:t[0]?"Latest":"\u2014",helper:t[0]||"No recent playback yet"})}
            </div>
          </section>

          <section class="media-section">
            ${j({title:"Recently watched",subtitle:t.length?t.join(" \xB7 "):"Latest playback sessions"})}
            <div class="history-grid">
              ${e.map(Ir).join("")}
            </div>
          </section>
        `:_({title:"No watch history yet",message:"Playback activity will appear here after you open a video from the library.",action:`<a href="#${l.HOME}" class="button">Browse library</a>`})}
    </section>
  `}function Et({label:e,value:t,description:r=""}){let n=`setting-${String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,o=`${n}-description`;return`
  <div class="form-field">
    <label class="control-label" for="${n}">${e}</label>
    <input id="${n}" class="control-input" type="text" value="${t}" disabled aria-disabled="true" aria-label="${e}" ${r?`aria-describedby="${o}"`:""} />
    ${r?`<p id="${o}" class="control-description">${r}</p>`:""}
  </div>
  `}function pe({label:e,value:t,description:r=""}){let n=`setting-${String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-")}`,o=`${n}-description`;return`
  <div class="form-field">
    <label class="control-label" for="${n}">${e}</label>
    <div id="${n}" class="control-select" role="text" aria-label="${e}" ${r?`aria-describedby="${o}"`:""}>${t}</div>
    ${r?`<p id="${o}" class="control-description">${r}</p>`:""}
  </div>
  `}function _e({label:e,checked:t,description:r=""}){let n=`setting-${String(e).toLowerCase().replace(/[^a-z0-9]+/g,"-")}-description`;return`
  <div class="form-field form-field--switch">
    <div class="form-field__row">
      <span class="control-label">${e}</span>
      <span class="switch ${t?"switch--on":"switch--off"}" role="img" aria-label="${e}: ${t?"On":"Off"}" ${r?`aria-describedby="${n}"`:""}>
        <span class="switch__track"></span>
        <span class="switch__thumb"></span>
      </span>
    </div>
    ${r?`<p id="${n}" class="control-description">${r}</p>`:""}
  </div>
  `}var Ce={version:"V2 preview",build:"Offline Study Library",description:"Preferences are intentionally read-only in this release so the app stays honest about what is currently implemented."},fe=({label:e,value:t,description:r=""})=>`
  <div class="form-field">
    <label class="control-label">${e}</label>
    <div class="control-select control-select--readonly">${t}</div>
    ${r?`<p class="control-description">${r}</p>`:""}
  </div>
`,Mr=({section:e,subtitle:t="",controls:r})=>`
  <section class="panel settings-section">
    ${j({title:e,subtitle:t})}
    <div class="form-section">
      ${r.join("")}
    </div>
  </section>
`;function Vr(){let e=g().settings;return e&&typeof e=="object"?e:{}}function Hr(){let e=Vr();return[{section:"General",subtitle:"Core app behavior and local library identity.",controls:[fe({label:"Library source",value:String(e.librarySource||"downloads/"),description:"Loaded from the local downloads directory."}),fe({label:"Language",value:String(e.language||"Browser default"),description:"Language follows the host browser and is not user-configurable yet."})]},{section:"Appearance",subtitle:"Visual preferences are surfaced here but remain read-only in this build.",controls:[pe({label:"Theme",value:String(e.theme||"System"),description:"Theme switching is not persisted in the current release."}),pe({label:"Navigation density",value:String(e.navigationDensity||"Compact"),description:"The current desktop layout uses the compact version by design."})]},{section:"Playback",subtitle:"Playback controls reflect the existing player lifecycle.",controls:[pe({label:"Default speed",value:String(e.defaultSpeed||"1x"),description:"Player speed is controlled from the player itself, not preferences."}),_e({label:"Autoplay next",checked:!!e.autoplayNext,description:"Unavailable in this release."})]},{section:"Library",subtitle:"Local file placement and indexing behavior.",controls:[Et({label:"Cache location",value:String(e.cacheLocation||"Local storage"),description:"Offline cache remains local to the device."}),_e({label:"Auto-scan",checked:!!e.autoScan,description:"Metadata indexing is handled at build time, not through a live scanner."})]}]}function _t(){let e=Hr();return`
    <section class="page-view" aria-labelledby="settings-title">
      ${M({eyebrow:"Settings",title:"Settings",description:"Preferences and local library information. Read-only controls are shown where settings are not yet implemented."})}

      <div class="page-grid">
        <div class="span-8">
          ${e.map(Mr).join("")}
        </div>
        <aside class="span-4">
          <section class="panel settings-aside">
            ${j({title:"About",subtitle:"Version and product status."})}
            <div class="stats-grid settings-about-grid">
              ${B({label:"Version",value:Ce.version,helper:"Desktop preview"})}
              ${B({label:"Build",value:Ce.build,helper:"Offline only"})}
            </div>
            <p class="card-copy">${Ce.description}</p>
          </section>

          <section class="panel settings-aside">
            ${j({title:"Status",subtitle:"What is active right now."})}
            <div class="form-section">
              ${fe({label:"Favorites",value:"Active",description:"Persisted locally and available throughout the app."})}
              ${fe({label:"History tracking",value:"Read-only",description:"This view shows history entries when the app has data to display."})}
            </div>
          </section>
        </aside>
      </div>
    </section>
  `}function Ct({id:e="",placeholder:t,value:r="",description:n="",ariaLabel:o="Search videos",disabled:i=!1}){return`
  <div class="search-box">
    <label class="search-box__label" ${e?`for="${e}"`:""}>
      <span class="visually-hidden">${o}</span>
      <input
        ${e?`id="${e}"`:""}
        class="search-box__input"
        type="search"
        value="${r}"
        placeholder="${t}"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        ${i?'disabled aria-disabled="true"':""}
        aria-label="${o}"
      />
    </label>
    ${n?`<p class="search-box__note">${n}</p>`:""}
  </div>
  `}function Lt({content:e}){return`
  <div class="toolbar">
    ${e}
  </div>
  `}var ge=null;function U(e=""){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function be(e,t){return e.map(r=>`<option value="${U(r)}"${r===t?" selected":""}>${U(r)}</option>`).join("")}function Or(e,t){return`
    <div class="search-toolbar__fields">
      <label class="form-field">
        <span class="control-label">Subject</span>
        <select id="search-filter-subject">${be(t.subjects,e.subject)}</select>
      </label>
      <label class="form-field">
        <span class="control-label">Resolution</span>
        <select id="search-filter-resolution">${be(t.resolutions,e.resolution)}</select>
      </label>
      <label class="form-field">
        <span class="control-label">Duration</span>
        <select id="search-filter-duration">${be(t.durations,e.duration)}</select>
      </label>
      <label class="form-field">
        <span class="control-label">File type</span>
        <select id="search-filter-fileType">${be(t.fileTypes,e.fileType)}</select>
      </label>
    </div>
  `}function Pr(e,t){return`
    <div class="search-toolbar__sort">
      <label class="form-field">
        <span class="control-label">Sort by</span>
        <select id="search-sort-by">
          ${e.map(r=>`<option value="${U(r.value)}"${r.value===t.by?" selected":""}>${U(r.label)}</option>`).join("")}
        </select>
      </label>
      <label class="form-field">
        <span class="control-label">Order</span>
        <select id="search-sort-order">
          <option value="desc"${t.order==="desc"?" selected":""}>Descending</option>
          <option value="asc"${t.order==="asc"?" selected":""}>Ascending</option>
        </select>
      </label>
    </div>
  `}function Fr(e){let t=Object.entries(e).filter(([,r])=>r&&r!=="All");return t.length?t.map(([r,n])=>`<span class="search-summary__filter-pill">${U(at(r))}: ${U(n)}</span>`).join(""):'<span class="search-summary__filter-pill">All filters</span>'}function Nr(e){return e.length?`
    <div class="search-history">
      <h3>Recent searches</h3>
      <div class="search-history__chips">
        ${e.map(t=>`<button type="button" class="chip" data-search-history="${U(t)}">${U(t)}</button>`).join("")}
      </div>
    </div>
  `:""}function Tt(e){if(!e)return;let t=e.querySelector("#search-query-input"),r=e.querySelector("#search-filter-subject"),n=e.querySelector("#search-filter-resolution"),o=e.querySelector("#search-filter-duration"),i=e.querySelector("#search-filter-fileType"),a=e.querySelector("#search-sort-by"),s=e.querySelector("#search-sort-order"),c=e.querySelector("[data-search-clear]"),p=e.querySelector(".search-history__chips"),d=[],b=ne(),h=de(u=>{w({searchQuery:String(u||"")}),String(u||"").trim()&&Xe(u),le()},200),k=u=>{h(u.target.value)},v=u=>{let y=u.target,R=y.id.replace("search-filter-","");G(R,y.value)},m=()=>{Ke(a.value,s.value)},V=()=>{ct(),le(),G("subject","All"),G("resolution","All"),G("duration","All"),G("fileType","All"),t&&(t.value="",t.focus())},O=u=>{if(u.key==="/"){document.activeElement!==t&&(u.preventDefault(),t.focus());return}if(u.key==="Escape"){u.preventDefault(),V();return}if(u.key==="ArrowDown"){u.preventDefault();let y=Math.min((ne().selectedIndex||0)+1,ce(x(),g().searchQuery).length-1);xe(y);return}if(u.key==="ArrowUp"){u.preventDefault();let y=Math.max((ne().selectedIndex||0)-1,0);xe(y);return}if(u.key==="Enter"&&document.activeElement===t){let y=ce(x(),g().searchQuery),R=ne().selectedIndex||0;y[R]&&(u.preventDefault(),N(`${l.PLAYER}/${encodeURIComponent(y[R].video.id)}`))}};if(t&&(d.push($(t,"input",k)),d.push($(t,"keydown",u=>u.stopPropagation()))),r&&d.push($(r,"change",v)),n&&d.push($(n,"change",v)),o&&d.push($(o,"change",v)),i&&d.push($(i,"change",v)),a&&d.push($(a,"change",m)),s&&d.push($(s,"change",m)),c&&d.push($(c,"click",V)),p&&d.push($(p,"click",u=>{let y=u.target.closest("[data-search-history]");if(!y)return;let R=y.dataset.searchHistory;R&&(w({searchQuery:R}),le())})),d.push($(window,"keydown",O)),ge=d,t){t.focus({preventScroll:!0});let u=String(t.value||"").length;try{t.setSelectionRange(u,u)}catch{}}}function Le(){ge&&(ge.forEach(e=>e()),ge=null)}function At(){let{searchQuery:e}=g(),t=x(),r=et(t),n=Ge(),o=st(),i=lt(),a=ce(t,e),s=tt(t,e),c=Ze();return`
    <section class="page-view" aria-labelledby="search-title">
      ${M({eyebrow:"Search",title:"Find videos with instant discovery.",description:"Search across title, subject, filename, description, and tags with fuzzy matching."})}

      <section class="panel search-toolbar-panel">
        ${Lt({content:`
            ${Ct({id:"search-query-input",placeholder:"Search videos, subjects, titles\u2026",value:e,ariaLabel:"Library search"})}
            ${Or(o,r)}
            ${Pr(n,i)}
            <div class="search-toolbar__actions">
              <button type="button" class="button button-secondary" data-search-clear>Clear search</button>
            </div>
          `})}
      </section>

      <section class="panel search-summary-panel">
        <div class="search-summary-grid">
          <div>
            <p class="eyebrow">Library</p>
            <strong>${s.totalVideos} Videos</strong>
          </div>
          <div>
            <p class="eyebrow">Subjects</p>
            <strong>${s.totalSubjects} Subjects</strong>
          </div>
          <div>
            <p class="eyebrow">Results</p>
            <strong>${s.filteredVideos} matching videos</strong>
          </div>
          <div>
            <p class="eyebrow">Sort</p>
            <strong>${s.sortLabel} \xB7 ${s.sortOrder}</strong>
          </div>
        </div>
        <div class="search-summary-filters" aria-live="polite">
          ${Fr(o)}
        </div>
      </section>

      ${e?"":Nr(c)}

      <section class="panel">
        ${a.length?`
            <div class="card-grid" id="search-results">
              ${a.map((p,d)=>I({title:p.video.title,titleHtml:p.highlight.title,subject:p.video.subject,subjectHtml:p.highlight.subject,duration:L(p.video),resolution:A(p.video),thumbnail:T(p.video),descriptionHtml:p.highlight.description,videoId:p.video.id,selected:d===s.selectedIndex})).join("")}
            </div>
          `:_({title:"No matching videos found",message:"Try clearing filters, changing the query, or returning to the library.",action:`<a href="#${l.HOME}">Return to library</a>`})}
      </section>
    </section>
  `}function Rt(e="Loading study library"){return`<div class="panel" role="status" aria-live="polite">${e}</div>`}var It=new Map([[l.HOME,pt],[l.SUBJECT,ht],[l.PLAYER,xt],[l.FAVORITES,jt],[l.HISTORY,kt],[l.SETTINGS,_t],[l.SEARCH,At]]),Ur=new Map([[l.HOME,E],[l.SUBJECT,"Subjects"],[l.PLAYER,"Player"],[l.FAVORITES,"Favorites"],[l.HISTORY,"History"],[l.SETTINGS,"Settings"],[l.SEARCH,"Search"]]),he={subject:/^\/subject\/([^/]+)$/,player:/^\/player\/([^/]+)$/};function oe(){let e=window.location.hash.replace(/^#/,"")||l.HOME;return e===l.HOME?{route:l.HOME,params:{}}:he.subject.test(e)?{route:l.SUBJECT,params:{subjectSlug:decodeURIComponent(e.match(he.subject)[1])}}:he.player.test(e)?{route:l.PLAYER,params:{videoId:decodeURIComponent(e.match(he.player)[1])}}:It.has(e)?{route:e,params:{}}:{route:"404",params:{}}}function me(){let{route:e,params:t}=oe(),{library:r,loading:n}=g(),o=Ur.get(e)||E;if(e===l.HOME)return{pageLabel:E,breadcrumbs:[{label:E}]};if(e===l.SUBJECT){let i=t.subjectSlug||null;if(!i||n||!r)return{pageLabel:"Subjects",breadcrumbs:[{label:E,route:l.HOME},{label:"Subjects"}]};let a=ee(i);return{pageLabel:a?a.name:"Subject not found",breadcrumbs:[{label:E,route:l.HOME},{label:"Subjects",route:l.SUBJECT},{label:a?a.name:"Not found"}]}}if(e===l.PLAYER){let i=t.videoId||null;if(n||!r)return{pageLabel:"Player",breadcrumbs:[{label:E,route:l.HOME},{label:"Player"}]};if(!i)return{pageLabel:"Player",breadcrumbs:[{label:E,route:l.HOME},{label:"Player"}]};let a=z(i);return{pageLabel:a?a.title:"Video not found",breadcrumbs:[{label:E,route:l.HOME},{label:"Player",route:l.PLAYER},{label:a?a.title:"Not found"}]}}return e==="404"?{pageLabel:"Page not found",breadcrumbs:[{label:E,route:l.HOME},{label:"Page not found"}]}:{pageLabel:o,breadcrumbs:[{label:E,route:l.HOME},{label:o}]}}function N(e){window.location.hash=e}function ye(e){let{loading:t,error:r}=g(),{route:n,params:o}=oe(),i=It.get(n)||null;if(t)return e.innerHTML=Rt(),e.focus({preventScroll:!0}),n;if(r)return Ee(),Le(),e.innerHTML=`
      <section class="page-view page-error">
        <div class="panel">
          <h2>Unable to load library</h2>
          <p>${r}</p>
        </div>
      </section>
    `,e.focus({preventScroll:!0}),n;if(Ee(),Le(),gt(),!i)return e.innerHTML=`
      <section class="page-view page-error">
        <div class="panel">
          <h2>Page not found</h2>
          <p>The page you requested does not exist.</p>
        </div>
      </section>
    `,e.focus({preventScroll:!0}),n;if(e.innerHTML=i(o),e.focus({preventScroll:!0}),n===l.PLAYER&&wt(e),n===l.SEARCH&&Tt(e),n===l.SUBJECT&&o.subjectSlug){let{library:a}=g();if(a){let s=ee(o.subjectSlug);if(s){let c=Q(s.name);bt(e,c)}}}return n}var Bt="sidebar-expanded";function Dr(){try{return localStorage.getItem(Bt)==="true"}catch{return!1}}function zr(e){try{localStorage.setItem(Bt,String(e))}catch{}document.documentElement.dataset.sidebarExpanded=String(e)}function Mt(){document.documentElement.dataset.sidebarExpanded=String(Dr())}function Te(){let e=document.documentElement.dataset.sidebarExpanded==="true";zr(!e)}function Vt(){let{currentPage:e,selectedSubject:t}=g(),r=F(),n=Ve.map(i=>{let s=i.route===e?' aria-current="page"':"";return`
      <li>
        <a class="nav-link" href="#${i.route}"${s} data-tooltip="${i.label}">
          <span class="nav-icon" aria-hidden="true">${i.icon}</span>
          <span class="nav-label">${i.label}</span>
        </a>
      </li>
    `}).join(""),o=r.length?r.map(i=>{let a=q(i),c=t===a?' aria-current="page"':"";return`
          <li>
            <a class="nav-link nav-link--nested" href="#${l.SUBJECT}/${a}"${c}>
              <span class="nav-label">${i.name}</span>
            </a>
          </li>
        `}).join(""):"";return`
    <button
      class="sidebar-toggle"
      type="button"
      aria-label="Toggle navigation"
      data-sidebar-toggle
    >
      <svg class="sidebar-toggle__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="4"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="8"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="12" width="14" height="1.5" rx="0.75" fill="currentColor"/>
      </svg>
    </button>

    <nav class="sidebar-nav" aria-label="Primary navigation">
      <ul class="nav-list" role="list">
        ${n}
      </ul>

      ${o?`
        <details class="sidebar-section" open>
          <summary class="sidebar-section__title">Subjects</summary>
          <ul class="nav-list nav-list--nested" role="list">
            ${o}
          </ul>
        </details>
      `:""}
    </nav>

    <div class="sidebar-status" role="status" aria-live="polite" aria-atomic="true">
      ${r.length?`${r.length} subject${r.length!==1?"s":""} \xB7 ${g().library?.total_videos??0} videos`:"Loading library\u2026"}
    </div>
  `}function Ht(e){let t=e.querySelector("[data-sidebar-toggle]");if(!t)return;let r=()=>Te();t.addEventListener("click",r)}function Ot({items:e}){return`
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>${e.map((r,n)=>{let o=n===e.length-1;return`
      <li class="breadcrumb-item">
        ${r.route&&!o?`<a href="#${r.route}">${r.label}</a>`:`<span aria-current="page">${r.label}</span>`}
      </li>
    `}).join("")}</ol>
  </nav>
  `}function Pt({icon:e,label:t,badge:r=""}){return`
  <button class="action-button" type="button" aria-label="${t}">
    <span class="action-button__icon">${e}</span>
    ${r?`<span class="action-button__badge">${r}</span>`:""}
  </button>
  `}var ve=null;function Ft(e){ve&&(ve(),ve=null);let t=e.querySelector("#global-library-search"),r=e.querySelector("[data-header-hamburger]"),n=s=>{let c=s.target.value;J.searchQuery=c;let{currentPage:p}=g();if(p!==l.SEARCH)N(l.SEARCH);else{let d=document.getElementById("app-main");d&&ye(d)}},o=s=>{s.key==="Escape"&&(t.value="",w({searchQuery:""}))},i=()=>Te(),a=[];t&&(t.addEventListener("input",n),t.addEventListener("keydown",o),a.push(()=>{t.removeEventListener("input",n),t.removeEventListener("keydown",o)})),r&&(r.addEventListener("click",i),a.push(()=>r.removeEventListener("click",i))),ve=()=>a.forEach(s=>s())}function Nt(){let{searchQuery:e}=g(),{breadcrumbs:t}=me(),r=String(e||"").replace(/"/g,"&quot;");return`
    
    <button class="header-hamburger" type="button" aria-label="Open navigation" data-header-hamburger>
      <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" width="18" height="18">
        <rect x="2" y="4"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="8"  width="14" height="1.5" rx="0.75" fill="currentColor"/>
        <rect x="2" y="12" width="14" height="1.5" rx="0.75" fill="currentColor"/>
      </svg>
    </button>
  

    <div class="header-breadcrumb">
      ${Ot({items:t})}
    </div>

    <div class="header-spacer"></div>

    <div class="header-search">
      <div class="search-box">
        <label class="search-box__label" for="global-library-search">
          <span class="visually-hidden">Search videos, subjects, files</span>
          <input
            id="global-library-search"
            class="search-box__input"
            type="search"
            value="${r}"
            placeholder="Search\u2026"
            autocomplete="off"
            spellcheck="false"
            aria-label="Global library search"
          />
        </label>
      </div>
    </div>

    <div class="header-controls" role="toolbar" aria-label="Header controls">
      ${Pt({icon:`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 1-2.51-1.44v-.09a1.65 1.65 0 0 0-1.1-1.55 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 12a1.65 1.65 0 0 1-1.44-2.51h.09A1.65 1.65 0 0 0 4.8 8.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9.12 4a1.65 1.65 0 0 1 2.51-1.44v.09a1.65 1.65 0 0 0 1.1 1.55 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 1 1.44 2.51h-.09a1.65 1.65 0 0 0-1.55 1.1z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,label:"Settings"})}
    </div>
  `}function Ut(){return""}function Dt(){return""}function K(e,t=document){let r=t.querySelector(e);if(!r)throw new Error(`Required element not found: ${e}`);return r}var zt="offline-study:favorites";function qr(e,t){try{let r=localStorage.getItem(e);return r?JSON.parse(r):t}catch{return t}}function Yr(e,t){localStorage.setItem(e,JSON.stringify(t))}var qt=()=>qr(zt,[]),Yt=e=>Yr(zt,e);var Jt=K("#app-sidebar"),Qt=K("#app-header"),Gt=K("#app-main"),Jr=K("#app-toast"),Qr=K("#app-modal"),Ae="[]";function Re(e){if(!Array.isArray(e))return[];let t=new Set;return e.map(r=>r&&typeof r=="object"&&r.id!=null?String(r.id):r==null?"":String(r)).filter(r=>!r||t.has(r)?!1:(t.add(r),!0))}function Wr(e){if(!e)return;let t=Re(g().favorites),r=String(e),n=t.includes(r)?t.filter(o=>o!==r):[...t,r];w({favorites:n})}function Wt(){Jt.innerHTML=Vt(),Ht(Jt),Qt.innerHTML=Nt(),Ft(Qt),ye(Gt),Gr()}function Gr(){let{pageLabel:e}=me();document.title=e&&e!==E?`${e} | ${E}`:E}function Kr(e){let t=e.target.closest("[data-favorite-toggle]");if(t){e.preventDefault(),e.stopPropagation(),Wr(t.dataset.videoId);return}let r=e.target.closest(".video-card");if(!r||!r.dataset.videoId)return;let n=r.dataset.videoId;N(`${l.PLAYER}/${encodeURIComponent(n)}`)}async function Xr(){Mt();let e=Re(qt());Ae=JSON.stringify(e),w({loading:!0,error:null,favorites:e,history:[],settings:{}}),Jr.innerHTML=Ut(),Qr.innerHTML=Dt(),(()=>{let{route:r,params:n}=oe();w({currentPage:r,selectedSubject:n.subjectSlug||null,selectedVideo:n.videoId||null})})(),He(()=>{let r=Re(g().favorites),n=JSON.stringify(r);n!==Ae&&(Yt(r),Ae=n),Wt()}),Wt(),$(Gt,"click",Kr);try{let r=await Pe();w({library:r,loading:!1})}catch(r){w({library:null,loading:!1,error:r instanceof Error?r.message:"Unable to load library."})}$(window,"hashchange",()=>{let{route:r,params:n}=oe(),o=g();(o.currentPage!==r||o.selectedSubject!==(n.subjectSlug||null)||o.selectedVideo!==(n.videoId||null))&&w({currentPage:r,selectedSubject:n.subjectSlug||null,selectedVideo:n.videoId||null})})}Xr();})();
//# sourceMappingURL=bundle.js.map
