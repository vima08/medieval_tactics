import {describe,it,expect} from 'vitest';
import {CAMPAIGN_MISSIONS} from '../src/engine/campaign';
import {COMMON_MISSIONS,campaignComplete,campaignRouteIds,newCampaignProgress,nextCampaignMissionId,recordCampaignVictory,restoreCampaignProgress,routeChoiceAvailable,selectCampaignRoute,unlockedMissionIds,type CampaignRoute} from '../src/campaign-progress';
import {beginStory,chooseStory,endStory,newStoryProgress,restoreStoryProgress,stepStory} from '../src/story-progress';
import {storyScene} from '../src/story-data';
import {campaignScreenHTML,campaignResultHTML} from '../src/campaign-ui';
import {createGame} from '../src/engine';
const common=()=>COMMON_MISSIONS.reduce(recordCampaignVictory,newCampaignProgress());
describe('campaign graph and consequential routes',()=>{
  for(const route of ['caravan','granary'] as CampaignRoute[])it(`reaches only the ${route} ending through nine victories`,()=>{
    let p=newCampaignProgress();expect(selectCampaignRoute(p,route)).toBe(p);
    for(const id of COMMON_MISSIONS){expect(nextCampaignMissionId(p)).toBe(id);p=recordCampaignVictory(p,id);}
    expect(routeChoiceAvailable(p)).toBe(true);expect(campaignComplete(p)).toBe(false);expect(nextCampaignMissionId(p)).toBeUndefined();
    p=selectCampaignRoute(p,route);const other=route==='caravan'?'granary':'caravan';expect(selectCampaignRoute(p,other)).toBe(p);expect(recordCampaignVictory(p,other)).toBe(p);
    expect(recordCampaignVictory(p,'summit')).toBe(p);
    for(const id of [route,'evacuation','summit']){expect(nextCampaignMissionId(p)).toBe(id);p=recordCampaignVictory(p,id);expect(restoreCampaignProgress(JSON.stringify(p))).toEqual(p);}
    expect(campaignComplete(p)).toBe(true);expect(p.completed).toHaveLength(9);expect(unlockedMissionIds(p)).toEqual(campaignRouteIds(p));expect(unlockedMissionIds(p)).not.toContain(other);
    expect(recordCampaignVictory(p,'ford')).toBe(p);expect(newCampaignProgress().route).toBeNull();
    const ending=storyScene('summit','outro',{route})!;expect(ending.lines.some(l=>l.text.includes('Эпилог'))).toBe(true);
  });
  it('migrates old completed saves without fabricating either branch',()=>{
    const p=restoreCampaignProgress(JSON.stringify({version:1,completed:[...COMMON_MISSIONS,'caravan','summit']}));expect(p).toEqual(common());expect(p.route).toBeNull();expect(routeChoiceAvailable(p)).toBe(true);
  });
  it('rejects unknown saves and removes impossible future and opposite branch victories',()=>{
    for(const raw of ['broken','null','{"version":3,"completed":[]}','{"version":2,"completed":{}}'])expect(restoreCampaignProgress(raw)).toEqual(newCampaignProgress());
    expect(restoreCampaignProgress('{"version":2,"completed":["ford","kiln","summit"],"route":"granary"}')).toEqual(recordCampaignVictory(newCampaignProgress(),'ford'));
    const p=restoreCampaignProgress(JSON.stringify({version:2,route:'caravan',completed:[...COMMON_MISSIONS,'granary','evacuation','summit']}));expect(p.completed).toEqual(COMMON_MISSIONS);expect(p.route).toBe('caravan');
  });
  it('preserves the first arc dialogue choice during replay and reload',()=>{
    let p=beginStory(newStoryProgress(),'gate','intro','battle');for(let i=0;i<3;i++)p=stepStory(p,1);p=chooseStory(p,'people');p=endStory(p);p=beginStory(p,'gate','intro','campaign');for(let i=0;i<3;i++)p=stepStory(p,1);
    expect(chooseStory(p,'orders')).toBe(p);expect(restoreStoryProgress(JSON.stringify({...p,choices:{...p.choices,route:'granary'}})).choices).toEqual({signal:'people',route:'granary'});
  });
  it('gives distinct shared aftermaths and epilogues while retaining the six scene identities',()=>{
    for(const id of COMMON_MISSIONS)expect(storyScene(id,'intro')).toBeDefined();for(const id of ['evacuation','summit'])for(const phase of ['intro','outro'] as const)expect(storyScene(id,phase,{route:'caravan'})!.lines).not.toEqual(storyScene(id,phase,{route:'granary'})!.lines);
    expect(CAMPAIGN_MISSIONS).toHaveLength(10);
  });
  it('shows the branch picker and nine mission count, never the opposite branch as next',()=>{
    expect(campaignScreenHTML(common(),5)).toContain('data-campaign-route="caravan"');expect(campaignScreenHTML(common(),5)).toContain('/ 9');
    let p=selectCampaignRoute(common(),'caravan');p=recordCampaignVictory(p,'caravan');const g=createGame({mode:'ai',map:'caravan',mission:'caravan'});g.winner='blue';const html=campaignResultHTML(g,p);expect(html).toContain('data-id="evacuation"');expect(html).not.toContain('data-id="granary"');
  });
});
