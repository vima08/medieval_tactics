import { CAMPAIGN_MISSIONS } from './engine/campaign';

export type CampaignProgress = { version:1; completed:string[] };
export const newCampaignProgress = ():CampaignProgress => ({version:1,completed:[]});
export function restoreCampaignProgress(raw:string|null):CampaignProgress {
  try {const value=JSON.parse(raw??'null');if(value?.version!==1||!Array.isArray(value.completed))return newCampaignProgress();
    return {version:1,completed:CAMPAIGN_MISSIONS.filter(m=>value.completed.includes(m.id)).map(m=>m.id)};
  } catch {return newCampaignProgress()}
}
export function missionUnlocked(progress:CampaignProgress,index:number):boolean {
  return index>=0&&index<CAMPAIGN_MISSIONS.length&&CAMPAIGN_MISSIONS.slice(0,index).every(m=>progress.completed.includes(m.id));
}
export function recordCampaignVictory(progress:CampaignProgress,id:string):CampaignProgress {
  const index=CAMPAIGN_MISSIONS.findIndex(m=>m.id===id);
  if(!missionUnlocked(progress,index)||progress.completed.includes(id))return progress;
  return {version:1,completed:[...progress.completed,id]};
}
