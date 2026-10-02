import { describe, it, expect } from 'vitest';
import { CAMPAIGN_MISSIONS, createGame, applyAction, legalMoves, replayGame, serializeGame, restoreGame, validateBlueprint } from '../src/engine';
import { newCampaignProgress, restoreCampaignProgress, missionUnlocked, recordCampaignVictory } from '../src/campaign-progress';

describe('authored learning campaign',()=>{
  it('introduces six distinct classes in order on six distinct viable maps',()=>{
    const known=new Set<string>();
    for(const mission of CAMPAIGN_MISSIONS){
      const game=createGame({map:mission.map,mode:'ai',mission:mission.id});
      expect(known.has(mission.introduced)).toBe(false);known.add(mission.introduced);
      expect(game.units.filter(u=>u.team==='blue').some(u=>u.archetype===mission.introduced)).toBe(true);
      expect(game.units.every(u=>known.has(u.archetype))).toBe(true);
      expect(validateBlueprint(mission.blue,{minUnits:1})).toEqual([]);
      expect(validateBlueprint(mission.red,{minUnits:1})).toEqual([]);
      const cells=new Set(game.units.map(u=>`${u.x},${u.y}`));expect(cells.size).toBe(game.units.length);
      for(const u of game.units){const tile=game.map.tiles[u.y*game.map.width+u.x];expect(tile).toBeDefined();expect(tile.terrain).not.toBe('water');expect(tile.object).not.toBe('cover')}
      expect(game.objective.kind).toBe(mission.objective);
      if(mission.objective==='control')expect(game.objective.points.length).toBeGreaterThanOrEqual(2);
    }
    expect(known.size).toBe(6);expect(new Set(CAMPAIGN_MISSIONS.map(m=>m.map)).size).toBe(6);
  });
  it('restores and replays authored deployment, objective and mission identity',()=>{
    for(const mission of CAMPAIGN_MISSIONS){let game=createGame({map:mission.map,mode:'ai',mission:mission.id,seed:19});
      const unit=game.units.find(u=>u.team==='blue')!,move=legalMoves(game,unit.id).find(c=>c.cost===1);
      expect(move).toBeDefined();game=applyAction(game,{type:'move',unitId:unit.id,x:move!.x,y:move!.y});
      expect(restoreGame(serializeGame(game))).toEqual(game);expect(replayGame(game.initial!,game.history)).toEqual(game);
    }
  });
  it('requires the actual objective before deadline, rather than winning by army size',()=>{
    let game=createGame({map:'ford',mode:'ai',mission:'ford'});
    for(let i=0;i<24;i++)game=applyAction(game,{type:'endTurn'});
    expect(game.turn).toBe(12);expect(game.winner).toBe('red');
    expect(game.units.filter(u=>u.alive&&u.team==='blue').length).toBe(2);
  });
  it('requires the control objective even after every defender has fallen',()=>{
    let game=createGame({map:'gate',mode:'ai',mission:'gate'});
    for(const u of game.units.filter(u=>u.team==='red')){u.hp=0;u.alive=false}
    game=applyAction(game,{type:'endTurn'});expect(game.winner).toBeUndefined();
    const points=game.objective.points;game.units[0].x=points[0].x;game.units[0].y=points[0].y;game.units[1].x=points[1].x;game.units[1].y=points[1].y;
    game=applyAction(game,{type:'endTurn'});expect(game.objective.scores.blue).toBe(1);expect(game.winner).toBeUndefined();
    game=applyAction(game,{type:'endTurn'});game=applyAction(game,{type:'endTurn'});expect(game.winner).toBe('blue');
  });
  it('unlocks only the next mission, permits replay and validates saved progress',()=>{
    let progress=newCampaignProgress();expect(missionUnlocked(progress,0)).toBe(true);expect(missionUnlocked(progress,1)).toBe(false);
    expect(recordCampaignVictory(progress,'kiln')).toEqual(progress);
    for(const [index,mission]of CAMPAIGN_MISSIONS.entries()){expect(missionUnlocked(progress,index)).toBe(true);progress=recordCampaignVictory(progress,mission.id);expect(recordCampaignVictory(progress,mission.id)).toEqual(progress)}
    expect(progress.completed).toHaveLength(6);expect(restoreCampaignProgress(JSON.stringify(progress))).toEqual(progress);
    expect(restoreCampaignProgress('{broken')).toEqual(newCampaignProgress());expect(restoreCampaignProgress('{"version":1,"completed":["fake"]}')).toEqual(newCampaignProgress());
  });
});
