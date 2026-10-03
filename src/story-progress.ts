import { STORY_MISSIONS, storyScene, type StoryPhase } from './story-data';
export type StoryCursor={mission:string;phase:StoryPhase;index:number;destination:'battle'|'campaign'};
export type StoryProgress={version:1;seen:string[];choices:Record<string,string>;cursor:StoryCursor|null};
export const newStoryProgress=():StoryProgress=>({version:1,seen:[],choices:{},cursor:null});
const phases:StoryPhase[]=['intro','outro','defeat'];
const sceneIds=STORY_MISSIONS.flatMap(id=>phases.map(phase=>id+':'+phase));
export function restoreStoryProgress(raw:string|null):StoryProgress {
  try{const v=JSON.parse(raw??'null');if(v?.version!==1)return newStoryProgress();
    const choices:Record<string,string>={};if(['people','orders'].includes(v.choices?.signal))choices.signal=v.choices.signal;
    if(['caravan','granary'].includes(v.choices?.route))choices.route=v.choices.route;
    const seen=sceneIds.filter(id=>Array.isArray(v.seen)&&v.seen.includes(id));let cursor:StoryCursor|null=null,c=v.cursor;
    if(c&&STORY_MISSIONS.includes(c.mission)&&phases.includes(c.phase)&&['battle','campaign'].includes(c.destination)){
      const scene=storyScene(c.mission,c.phase,choices)!;if(Number.isInteger(c.index)&&c.index>=0&&c.index<scene.lines.length)cursor={mission:c.mission,phase:c.phase,index:c.index,destination:c.phase==='intro'?c.destination:'campaign'};
    }
    return{version:1,seen,choices,cursor};
  }catch{return newStoryProgress()}
}
export function beginStory(progress:StoryProgress,mission:string,phase:StoryPhase,destination:StoryCursor['destination']):StoryProgress {
  if(!storyScene(mission,phase,progress.choices))return progress;
  return{...progress,cursor:{mission,phase,index:0,destination:phase==='intro'?destination:'campaign'}};
}
export function chooseStory(progress:StoryProgress,value:string):StoryProgress {
  const c=progress.cursor;if(!c)return progress;const line=storyScene(c.mission,c.phase,progress.choices)?.lines[c.index];const option=line?.choice?.options.find(o=>o.value===value);
  return option&&!progress.choices[line!.choice!.id]?{...progress,choices:{...progress.choices,[line!.choice!.id]:option.value}}:progress;
}
export function stepStory(progress:StoryProgress,delta:1|-1):StoryProgress {
  const c=progress.cursor;if(!c)return progress;const scene=storyScene(c.mission,c.phase,progress.choices)!;
  if(delta===1&&scene.lines[c.index].choice&&!progress.choices[scene.lines[c.index].choice!.id])return progress;
  return{...progress,cursor:{...c,index:Math.max(0,Math.min(scene.lines.length-1,c.index+delta))}};
}
export function endStory(progress:StoryProgress):StoryProgress {
  const c=progress.cursor;if(!c)return progress;const id=c.mission+':'+c.phase;
  return{...progress,seen:[...new Set([...progress.seen,id])],cursor:null};
}
export function unansweredChoice(progress:StoryProgress):boolean {
  const c=progress.cursor;if(!c)return false;
  return storyScene(c.mission,c.phase,progress.choices)!.lines.some(l=>l.choice&&!progress.choices[l.choice.id]);
}

