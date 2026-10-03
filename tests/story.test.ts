import { describe,it,expect } from 'vitest';
import { CHARACTERS, STORY_MISSIONS, charactersForLanguage, storyScene } from '../src/story-data';
import { newStoryProgress,restoreStoryProgress,beginStory,chooseStory,stepStory,endStory,unansweredChoice } from '../src/story-progress';
import { AMBIENT_PROFILES } from '../src/ambience';
import { CAMPAIGN_MISSIONS } from '../src/engine';

describe('campaign narrative and recovery',()=>{
  it('covers all missions and keeps stable male character identities in both languages',()=>{
    expect(STORY_MISSIONS).toEqual(CAMPAIGN_MISSIONS.map(m=>m.id));
    expect(Object.values(CHARACTERS).map(c=>c.name)).toEqual(['Верен','Илья','Радомир','Бор','Тихон','Савва']);
    expect(Object.values(charactersForLanguage('en')).map(c=>c.name)).toEqual(['Veren','Ilya','Radomir','Bor','Tikhon','Savva']);
    const speakers=new Set<string>();
    for(const id of STORY_MISSIONS)for(const phase of ['intro','outro','defeat'] as const){
      const scene=storyScene(id,phase)!;expect(scene.lines.length).toBeGreaterThanOrEqual(2);expect(AMBIENT_PROFILES[scene.ambience]).toBeDefined();
      for(const line of scene.lines){expect(line.text.trim().length).toBeGreaterThan(0);if(line.speaker){expect(CHARACTERS[line.speaker]).toBeDefined();speakers.add(line.speaker)}}
    }
    expect(speakers.size).toBe(6);
  });
  it('authors full English scenes and preserves cursor positions, choices and effects across locales',()=>{
    for(const route of ['caravan','granary'])for(const signal of ['people','orders'])for(const id of STORY_MISSIONS)for(const phase of ['intro','outro','defeat'] as const){
      const choices={route,signal},ru=storyScene(id,phase,choices,'ru')!,en=storyScene(id,phase,choices,'en')!;
      expect(en.lines.length).toBe(ru.lines.length);expect(en.ambience).toBe(ru.ambience);expect(en.art).toBe(ru.art);
      expect(JSON.stringify(en)).not.toMatch(/[А-Яа-яЁё]/);
      en.lines.forEach((line,index)=>{
        expect(line.text).not.toBe(ru.lines[index].text);expect(line.speaker).toBe(ru.lines[index].speaker);expect(line.effect).toBe(ru.lines[index].effect);
        expect(line.choice?.options.map(o=>o.value)).toEqual(ru.lines[index].choice?.options.map(o=>o.value));
      });
    }
    expect(JSON.stringify(charactersForLanguage('en'))).not.toMatch(/[А-Яа-яЁё]/);
  });
  it('explains concrete objectives and the costs of both routes',()=>{
    const text=(id:string,phase:'intro'|'outro',route='caravan',language:'ru'|'en'='en')=>storyScene(id,phase,{route},language)!.lines.map(l=>l.text).join(' ');
    expect(text('caravan','intro')).toContain('Miron must reach the marked exit');
    expect(text('granary','intro')).toContain('four full rounds');
    expect(text('evacuation','intro')).toContain('Both Miron and Oleg');
    expect(text('summit','intro')).toContain('take the commander off the stairs');
    expect(text('kiln','outro')).toContain('younger brother');
    expect(text('summit','outro','caravan')).toContain('borrow seed');
    expect(text('summit','outro','granary')).toContain('We buried the drivers');
    expect(text('summit','outro','granary')).toContain('bereaved families received my report');
    expect(text('summit','outro','granary','ru')).toContain('Семьи погибших получили мой отчёт');
  });
  it('restores interrupted scenes and keeps match progress separate',()=>{
    let p=beginStory(newStoryProgress(),'ford','intro','battle');p=stepStory(p,1);
    expect(restoreStoryProgress(JSON.stringify(p))).toEqual(p);expect(p.cursor?.index).toBe(1);
    p=endStory(p);expect(p.cursor).toBeNull();expect(p.seen).toEqual(['ford:intro']);expect(endStory(p)).toEqual(p);
    expect(storyScene('invalid','intro')).toBeUndefined();
  });
  it('requires an explicit choice, locks it on replay and reflects it in later dialogue',()=>{
    let p=beginStory(newStoryProgress(),'gate','intro','battle');for(let i=0;i<3;i++)p=stepStory(p,1);
    expect(p.cursor?.index).toBe(3);expect(unansweredChoice(p)).toBe(true);expect(stepStory(p,1)).toEqual(p);expect(chooseStory(p,'invalid')).toEqual(p);
    p=chooseStory(p,'people');expect(p.choices.signal).toBe('people');expect(unansweredChoice(p)).toBe(false);expect(chooseStory(p,'orders')).toEqual(p);
    expect(stepStory(p,1).cursor?.index).toBe(4);
    const a=storyScene('kiln','outro',{signal:'people'})!,b=storyScene('kiln','outro',{signal:'orders'})!;
    expect(a.lines).not.toEqual(b.lines);expect(a.lines.some(l=>l.text.includes('Мы обещали открыть дорогу семьям'))).toBe(true);
  });
  it('preserves legacy choice values and valid saved cursor positions',()=>{
    for(const signal of ['people','orders'])for(const route of ['caravan','granary']){
      const saved={version:1,seen:['kiln:outro'],choices:{signal,route},cursor:{mission:'gate',phase:'intro',index:3,destination:'battle'}};
      const p=restoreStoryProgress(JSON.stringify(saved));expect(p.choices).toEqual({signal,route});expect(p.cursor).toEqual(saved.cursor);
      expect(unansweredChoice(p)).toBe(false);expect(storyScene('gate','intro',p.choices,'en')!.lines[3].choice?.id).toBe('signal');
    }
  });
  it('validates stored values and cannot turn an outro into a battle launch',()=>{
    expect(restoreStoryProgress('broken')).toEqual(newStoryProgress());
    expect(restoreStoryProgress('{"version":9}')).toEqual(newStoryProgress());
    const invalid={version:1,seen:['ford:intro','forged'],choices:{signal:'invalid',other:'x'},cursor:{mission:'ford',phase:'intro',index:999,destination:'battle'}};
    const p=restoreStoryProgress(JSON.stringify(invalid));expect(p.cursor).toBeNull();expect(p.seen).toEqual(['ford:intro']);expect(p.choices).toEqual({});
    invalid.cursor={mission:'ford',phase:'outro',index:1,destination:'battle'};expect(restoreStoryProgress(JSON.stringify(invalid)).cursor?.destination).toBe('campaign');
  });
  it('caps navigation and preserves seen scenes across repeated viewings',()=>{
    let p=beginStory(newStoryProgress(),'ford','intro','campaign');expect(stepStory(p,-1)).toEqual(p);for(let i=0;i<20;i++)p=stepStory(p,1);expect(p.cursor?.index).toBe(storyScene('ford','intro')!.lines.length-1);
    p=endStory(p);p=endStory(beginStory(p,'ford','intro','campaign'));expect(p.seen).toEqual(['ford:intro']);
  });
  it('uses four distinct ambient arrangements with safe local synthesis parameters',()=>{
    expect(new Set(Object.values(AMBIENT_PROFILES).map(p=>JSON.stringify(p))).size).toBe(4);
    for(const p of Object.values(AMBIENT_PROFILES)){expect(p.tempo).toBeGreaterThan(500);expect(p.wind).toBeLessThan(.05);expect(p.notes.filter(n=>n>0)).not.toHaveLength(0)}
  });
});
