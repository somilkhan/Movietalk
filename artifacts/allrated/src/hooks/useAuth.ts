import { useState, useEffect, useCallback } from 'react';
import { getSession, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, subscribeToAuthChanges, type SupabaseSession } from '@/lib/supabase';
const PROFILE_KEY='rabbitrip.profile'; const SESSION_KEY='rabbitrip_session_id';
interface Profile { id:string; email:string; username:string; }
function sessionToProfile(session:SupabaseSession|null):Profile|null { if(!session?.user?.id)return null; const username=typeof session.user.user_metadata?.username==='string'?session.user.user_metadata.username:(session.user.email?.split('@')[0]||'User'); return {id:session.user.id,email:session.user.email||'',username}; }
function storeProfile(profile:Profile|null){try{if(profile)localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));else localStorage.removeItem(PROFILE_KEY);}catch{} window.dispatchEvent(new Event('rabbitrip:profile-updated'));}
export function useAuth(){
  const [profile,setProfile]=useState<Profile|null>(null); const [isReady,setIsReady]=useState(false);
  useEffect(()=>{let mounted=true; const finish=(session:SupabaseSession|null)=>{if(!mounted)return;const next=sessionToProfile(session);setProfile(next);storeProfile(next);setIsReady(true);}; const initialize=async()=>{try{finish(await getSession());}catch{finish(null);}}; void initialize(); const unsubscribe=subscribeToAuthChanges(session=>finish(session)); return()=>{mounted=false;unsubscribe();};},[]);
  const login=useCallback(async(email:string,password:string)=>{const session=await supabaseSignIn(email,password);const next=sessionToProfile(session);setProfile(next);storeProfile(next);return next;},[]);
  const register=useCallback(async(email:string,password:string,username?:string)=>{const result=await supabaseSignUp(email,password,username);const next=sessionToProfile(result.session);if(next){setProfile(next);storeProfile(next);}return result;},[]);
  const logout=useCallback(async()=>{await supabaseSignOut();setProfile(null);try{localStorage.removeItem(SESSION_KEY);}catch{}storeProfile(null);},[]);
  return {profile,isLoggedIn:!!profile,isReady,login,register,logout};
}
export function requireAuth(callback:()=>void,onNeedLogin:()=>void){const raw=localStorage.getItem(PROFILE_KEY);if(raw)callback();else onNeedLogin();}
