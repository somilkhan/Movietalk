import { getSessionId } from './session';
import { getAccessToken } from './supabase';
const BASE=import.meta.env.BASE_URL.replace(/\/$/,'');
async function apiFetch(path:string,init:RequestInit={}){const token=getAccessToken();const hasBody=init.body!==undefined;const headers:Record<string,string>={...(hasBody?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})};const res=await fetch(`${BASE}${path}`,{...init,headers:{...headers,...(init.headers||{})}});if(!res.ok)throw new Error(`API error ${res.status}`);return res.json();}
export type TitleSnapshot={title:string;posterPath:string|null;backdropPath:string|null;year:string|null;voteAverage:number;mediaType:'movie'|'tv'};
export type RatingEntry={titleId:number;mediaType:'movie'|'tv';rating:number;titleSnapshot:TitleSnapshot;ratedAt:string};
export async function fetchMyRatings():Promise<RatingEntry[]>{const sid=getSessionId();return apiFetch(`/api/ratings?sessionId=${encodeURIComponent(sid)}`);}
export async function fetchTitleRating(mediaType:string,titleId:number):Promise<number|null>{const sid=getSessionId();try{const data=await apiFetch(`/api/ratings/${mediaType}/${titleId}?sessionId=${encodeURIComponent(sid)}`);return data.rating??null;}catch{return null;}}
export async function rateTitle(titleId:number,mediaType:'movie'|'tv',rating:number,snapshot:TitleSnapshot):Promise<void>{const sid=getSessionId();await apiFetch('/api/ratings',{method:'POST',body:JSON.stringify({sessionId:sid,titleId,mediaType,rating,titleSnapshot:snapshot})});}
export async function unrateTitle(mediaType:string,titleId:number):Promise<void>{const sid=getSessionId();await apiFetch(`/api/ratings/${mediaType}/${titleId}?sessionId=${encodeURIComponent(sid)}`,{method:'DELETE'});}
export type WatchlistEntry={titleId:number;mediaType:'movie'|'tv';titleSnapshot:TitleSnapshot;addedAt:string};
export async function fetchMyWatchlist():Promise<WatchlistEntry[]>{return apiFetch('/api/watchlist');}
export async function fetchWatchlistStatus(mediaType:string,titleId:number):Promise<boolean>{try{const data=await apiFetch(`/api/watchlist/${mediaType}/${titleId}`);return !!data.inWatchlist;}catch{return false;}}
export async function addToWatchlist(titleId:number,mediaType:'movie'|'tv',snapshot:TitleSnapshot):Promise<void>{await apiFetch('/api/watchlist',{method:'POST',body:JSON.stringify({titleId,mediaType,titleSnapshot:snapshot})});}
export async function removeFromWatchlist(mediaType:string,titleId:number):Promise<void>{await apiFetch(`/api/watchlist/${mediaType}/${titleId}`,{method:'DELETE'});}
