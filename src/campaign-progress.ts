import { CAMPAIGN_MISSIONS } from './engine/campaign';
export type CampaignRoute='caravan'|'granary';
export type CampaignProgress={version:2;completed:string[];route:CampaignRoute|null};
export const COMMON_MISSIONS=['ford','watch','steps','gate','marsh','kiln'];
export const CAMPAIGN_PLAYTHROUGH_LENGTH=9;
export const newCampaignProgress=():CampaignProgress=>({version:2,completed:[],route:null});
export const resetCampaignProgress=newCampaignProgress;
export function campaignRouteIds(progress:CampaignProgress):string[]{return [...COMMON_MISSIONS,...(progress.route?[progress.route,'evacuation','summit']:[])];}
export function routeChoiceAvailable(progress:CampaignProgress):boolean{return !progress.route&&COMMON_MISSIONS.every(id=>progress.completed.includes(id));}
export function selectCampaignRoute(progress:CampaignProgress,route:CampaignRoute):CampaignProgress{return routeChoiceAvailable(progress)&&(route==='caravan'||route==='granary')?{...progress,route}:progress;}
export function unlockedMissionIds(progress:CampaignProgress):string[]{const path=campaignRouteIds(progress);return path.filter((_,i)=>path.slice(0,i).every(id=>progress.completed.includes(id)));}
export function nextCampaignMissionId(progress:CampaignProgress):string|undefined{return unlockedMissionIds(progress).find(id=>!progress.completed.includes(id));}
export function missionUnlocked(progress:CampaignProgress,index:number):boolean{return !!CAMPAIGN_MISSIONS[index]&&unlockedMissionIds(progress).includes(CAMPAIGN_MISSIONS[index].id);}
export function campaignComplete(progress:CampaignProgress):boolean{return !!progress.route&&campaignRouteIds(progress).every(id=>progress.completed.includes(id));}
export function recordCampaignVictory(progress:CampaignProgress,id:string):CampaignProgress{return unlockedMissionIds(progress).includes(id)&&!progress.completed.includes(id)?{...progress,completed:[...progress.completed,id]}:progress;}
export function restoreCampaignProgress(raw:string|null):CampaignProgress{
  try{const v=JSON.parse(raw??'null');if(!v||![1,2].includes(v.version)||!Array.isArray(v.completed))return newCampaignProgress();let progress=newCampaignProgress();
    for(const id of COMMON_MISSIONS){if(!v.completed.includes(id))break;progress=recordCampaignVictory(progress,id);}
    if(v.version===2&&(v.route==='caravan'||v.route==='granary'))progress=selectCampaignRoute(progress,v.route);
    if(progress.route)for(const id of [progress.route,'evacuation','summit']){if(!v.completed.includes(id))break;progress=recordCampaignVictory(progress,id);}
    return progress;
  }catch{return newCampaignProgress();}
}
