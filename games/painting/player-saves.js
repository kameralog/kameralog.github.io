export class SavedItems {
 constructor(){this.user=undefined;this.F=null;this.db=null;this.version=0;this.listeners=new Set();this.stops=[];this.ids={savedArtists:new Set(),favoriteWorks:new Set()};this.checked={savedArtists:false,favoriteWorks:false};this.pending=new Map();this.failure=null;}
 subscribe(fn){this.listeners.add(fn);fn({});return ()=>this.listeners.delete(fn);}
 emit(event={}){for(const fn of this.listeners){try{fn(event);}catch(e){console.warn('Save controls:',e.name);}}}
 token(kind,id){if(!Object.hasOwn(this.ids,kind)||typeof id!=='string'||!id)throw Error('Invalid saved item');return kind+':'+id;}
 state(kind,id){const tag=this.token(kind,id);if(this.user===undefined)return this.failure?'unavailable':'connecting';if(!this.user)return 'guest';if(this.pending.has(tag))return 'pending';if(this.ids[kind].has(id))return 'saved';return this.checked[kind]?'idle':'checking';}
 bind(user,F,db){
  this.version++;for(const stop of this.stops)stop();this.stops=[];this.user=user;this.F=F;this.db=db;this.pending.clear();this.failure=null;
  for(const kind of Object.keys(this.ids)){this.ids[kind].clear();this.checked[kind]=false;}this.emit();
  if(!user)return;const version=this.version,uid=user.uid;
  for(const kind of Object.keys(this.ids))this.stops.push(F.onSnapshot(F.collection(db,'players',uid,kind),{includeMetadataChanges:true},snapshot=>{
   if(version!==this.version||this.user?.uid!==uid||snapshot.metadata.fromCache||snapshot.metadata.hasPendingWrites)return;
   this.ids[kind]=new Set(snapshot.docs.map(d=>d.id));this.checked[kind]=true;this.emit();
  },error=>{if(version!==this.version)return;this.checked[kind]=true;this.emit({error});}));
 }
 async add(kind,id,data){
  const tag=this.token(kind,id);if(!this.user){const e=Error('Sign in required');e.code='saves/login-required';throw e;}
  if(this.pending.has(tag))return this.pending.get(tag);if(this.ids[kind].has(id))return true;
  const version=this.version,uid=this.user.uid;
  const task=(async()=>{
   await Promise.resolve();
   try{
    await this.F.setDoc(this.F.doc(this.db,'players',uid,kind,id),data);
    if(version!==this.version||this.user?.uid!==uid)return false;
    this.ids[kind].add(id);this.pending.delete(tag);this.emit({saved:tag});return true;
   }catch(error){if(version!==this.version)return false;throw error;}
   finally{if(version===this.version){this.pending.delete(tag);this.emit();}}
  })();this.pending.set(tag,task);this.emit();return task;
 }
 async remove(kind,id){
  const tag=this.token(kind,id);if(!this.user)return false;if(this.pending.has(tag))return this.pending.get(tag);
  const version=this.version,uid=this.user.uid;
  const task=(async()=>{
   await Promise.resolve();
   try{
    await this.F.deleteDoc(this.F.doc(this.db,'players',uid,kind,id));
    if(version!==this.version||this.user?.uid!==uid)return false;
    this.ids[kind].delete(id);this.pending.delete(tag);this.emit({removed:tag});return true;
   }catch(error){if(version!==this.version)return false;throw error;}
   finally{if(version===this.version){this.pending.delete(tag);this.emit();}}
  })();this.pending.set(tag,task);this.emit();return task;
 }
 async toggle(kind,id,data){const tag=this.token(kind,id);if(this.pending.has(tag))return this.pending.get(tag);return this.ids[kind].has(id)?this.remove(kind,id):this.add(kind,id,data);}
}
export const saves=new SavedItems();
let connection=null;
export function connectSaves(){
 if(connection)return connection;
 connection=(async()=>{
  const [App,A,F]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js')]);
  let app;for(let i=0;i<150;i++){app=App.getApps().find(a=>a.name==='painting-player');if(app)break;await new Promise(r=>setTimeout(r,200));}
  if(!app)throw Error('Auth unavailable');
  A.onAuthStateChanged(A.getAuth(app),user=>saves.bind(user,F,F.getFirestore(app)),error=>{saves.failure=error;saves.emit({error});});
 })().catch(error=>{connection=null;saves.failure=error;saves.emit({error});throw error;});
 return connection;
}
