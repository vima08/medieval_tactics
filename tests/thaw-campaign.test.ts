import {describe,it,expect} from 'vitest';
import {CAMPAIGN_MISSIONS,createGame,applyAction,legalMoves,replayGame,serializeGame,restoreGame,validateBlueprint} from '../src/engine';
import {CAMPAIGNS,getCampaign,missionCampaignId} from '../src/campaign-registry';
import {newCampaignProgress,recordCampaignVictory,restoreCampaignProgress,missionUnlocked,campaignComplete,routeChoiceAvailable} from '../src/campaign-progress';
import {campaignScreenHTML,campaignResultHTML} from '../src/campaign-ui';
import {storyScene} from '../src/story-data';
import {newStoryProgress,beginStory,restoreStoryProgress} from '../src/story-progress';
const missions=CAMPAIGN_MISSIONS.slice(10);
describe('Bells of the Thaw',()=>{
  it('preserves first campaign indices and defines six distinct authored maps and all objective geometries',()=>{
    expect(CAMPAIGN_MISSIONS.slice(0,10).map(m=>m.id)).toEqual(getCampaign('embers').missionIds);
    expect(missions.map(m=>m.id)).toEqual(getCampaign('thaw').missionIds);
    expect(new Set(missions.map(m=>m.objective)).size).toBe(6);expect(new Set(missions.map(m=>m.map)).size).toBe(6);
    for(const m of missions){const g=createGame({map:m.map,mode:'ai',mission:m.id});expect(missionCampaignId(m.id)).toBe('thaw');expect(g.map.width).toBeGreaterThanOrEqual(12);expect(g.map.height).toBeGreaterThanOrEqual(9);expect(validateBlueprint(m.blue,{minUnits:1})).toEqual([]);expect(validateBlueprint(m.red,{minUnits:1})).toEqual([]);const cells=new Set(g.units.map(u=>`${u.x},${u.y}`));expect(cells.size).toBe(g.units.length);for(const u of g.units){const tile=g.map.tiles[u.y*g.map.width+u.x];expect(tile.terrain).not.toBe('water');expect(tile.object).not.toBe('cover');expect(legalMoves({...g,team:u.team},u.id).length).toBeGreaterThan(0);}if(m.objective==='control')expect(g.objective.points).toHaveLength(3);}
  });
  it('keeps independent linear unlocks and old save shape; rejects forged out-of-order completion',()=>{
    expect(newCampaignProgress()).toEqual({version:2,completed:[],route:null});let p=newCampaignProgress('thaw');expect(missionUnlocked(p,10)).toBe(true);expect(missionUnlocked(p,0)).toBe(false);expect(missionUnlocked(p,11)).toBe(false);expect(routeChoiceAvailable(p)).toBe(false);expect(recordCampaignVictory(p,'ford')).toEqual(p);
    for(const [i,m]of missions.entries()){expect(missionUnlocked(p,i+10)).toBe(true);p=recordCampaignVictory(p,m.id);expect(restoreCampaignProgress(JSON.stringify(p),'thaw')).toEqual(p);}expect(campaignComplete(p)).toBe(true);expect(p.route).toBeNull();expect(restoreCampaignProgress('{bad','thaw')).toEqual(newCampaignProgress('thaw'));expect(restoreCampaignProgress(JSON.stringify({version:2,campaignId:'thaw',completed:['thaw_sluice']}))).toEqual(newCampaignProgress('thaw'));expect(CAMPAIGNS).toHaveLength(2);
  });
  it('serializes and deterministically replays every deployment and genuine move',()=>{
    for(const m of missions){let g=createGame({map:m.map,mode:'ai',mission:m.id,seed:41});const u=g.units[0],cell=legalMoves(g,u.id)[0];g=applyAction(g,{type:'move',unitId:u.id,x:cell.x,y:cell.y});expect(restoreGame(serializeGame(g))).toEqual(g);expect(replayGame(g.initial!,g.history)).toEqual(g);}
  });
  it('authors all phases in both languages and restores each independent story cursor',()=>{
    for(const m of missions)for(const phase of ['intro','outro','defeat']as const){const ru=storyScene(m.id,phase)!,en=storyScene(m.id,phase,{},'en')!;expect(ru.lines.length).toBeGreaterThanOrEqual(2);expect(en.lines.length).toBe(ru.lines.length);expect(JSON.stringify(en)).not.toMatch(/[А-Яа-яЁё]/);ru.lines.forEach((l,i)=>{expect(en.lines[i].speaker).toBe(l.speaker);expect(en.lines[i].effect).toBe(l.effect)});const story=beginStory(newStoryProgress(),m.id,phase,'battle');expect(restoreStoryProgress(JSON.stringify(story))).toEqual(story);}
  });
  it('renders global mission indices for the active campaign and its own finale',()=>{
    const p=newCampaignProgress('thaw'),html=campaignScreenHTML(p,0);expect(html).toContain('Колокола оттепели');expect(html).toContain('data-mission="10"');expect(html).not.toContain('data-mission="0"');expect(html).not.toContain('Кого защитит дозор?');const g=createGame({map:'thaw_sluice',mode:'ai',mission:'thaw_sluice'});g.winner='blue';expect(campaignResultHTML(g,p)).toContain('Кампания завершена');
  });
});
