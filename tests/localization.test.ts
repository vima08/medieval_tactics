import { describe, expect, it } from 'vitest';
import { translate, localizedHTML } from '../src/i18n';
import { ENGLISH } from '../src/localization/en';
import { howToHTML } from '../src/how-to';
import { campaignScreenHTML, campaignLessonHTML, campaignResultHTML, renderNewCampaignConfirmation, renderCampaignRouteChoice, campaignSelectionHTML } from '../src/campaign-ui';
import { scenarioObjectiveHTML } from '../src/campaign-objective-ui';
import { CAMPAIGN_MISSIONS, createGame, ARCHETYPES, VARIANTS, MODIFIERS, ARTIFACTS } from '../src/engine';
import { restoreCampaignProgress } from '../src/campaign-progress';
import { storyHTML } from '../src/story-ui';
import { STORY_MISSIONS, storyScene } from '../src/story-data';
import type { StoryProgress } from '../src/story-progress';

const cyrillic = /[А-Яа-яЁё]/;
function englishOnly(html: string) {
  const localized = localizedHTML(html, 'en');
  const visible = localized.replace(/<[^>]*>/g, '');
  expect(visible.match(/[А-Яа-яЁё][А-Яа-яЁё\s.,;:!?−–—«»\d-]*/g) ?? [], visible).toEqual([]);
  return localized;
}
describe('English presentation catalog', () => {
  it('preserves Russian and renders the menu and touch vocabulary', () => {
    const source = 'Пепел и знамя · Кампания · Приём · Подтвердить шаг · Клетки · Снять выбор';
    expect(translate(source, 'ru')).toBe(source);
    expect(translate(source, 'en')).toBe('Ash and Banner · Campaign · Ability · Confirm move · Tiles · Clear selection');
  });
  it('covers every class, specialization, modifier, and artifact without changing the catalog', () => {
    const before = JSON.stringify({ ARCHETYPES, VARIANTS, MODIFIERS, ARTIFACTS });
    const strings = [
      ...Object.values(ARCHETYPES).flatMap(x => [x.description, x.ability]),
      ...Object.values(VARIANTS).flat().flatMap(x => [x.name, x.description]),
      ...Object.values(MODIFIERS).flatMap(x => [x.name, x.description]),
      ...Object.values(ARTIFACTS).flatMap(x => [x.name, x.description]),
    ];
    for (const source of strings) expect(translate(source, 'en')).not.toMatch(cyrillic);
    expect(JSON.stringify({ ARCHETYPES, VARIANTS, MODIFIERS, ARTIFACTS })).toBe(before);
  });
  it('translates the complete rules guide, including prose interrupted by inline markup', () => {
    const html=englishOnly(howToHTML());
    expect(html).toContain('Home returns the aim');
    expect(html).toContain('Ctrl + Enter always ends the turn');
    expect(html).toContain("Each mission's deadline");
    expect(translate('Пройдено: 2 / 6 · Продолжить бой','en')).toBe('Completed: 2 / 6 · Continue battle');
  });
  it('translates the actual novel shell, log, unanswered choice and final navigation in all forty-eight scenes', () => {
    expect(STORY_MISSIONS).toHaveLength(16);
    for (const mission of STORY_MISSIONS) for (const phase of ['intro','outro','defeat'] as const) {
      const scene=storyScene(mission,phase,{},'en')!;
      const indices=new Set([0,scene.lines.length-1,...scene.lines.flatMap((line,index)=>line.choice?[index]:[])]);
      for(const index of indices){
        const progress:StoryProgress={version:1,seen:[],choices:{},cursor:{mission,phase,index,destination:phase==='intro'?'battle':'campaign'}};
        for(const showLog of [false,true])expect(englishOnly(storyHTML(progress,false,showLog,'en'))).not.toMatch(cyrillic);
      }
    }
  });
  it('translates every campaign briefing, lesson, result, reset, and route choice', () => {
    expect(CAMPAIGN_MISSIONS).toHaveLength(16);
    const progress = restoreCampaignProgress(null);
    englishOnly(campaignSelectionHTML());
    for (let index = 0; index < CAMPAIGN_MISSIONS.length; index++) {
      const missionProgress=restoreCampaignProgress(null,CAMPAIGN_MISSIONS[index].id.startsWith('thaw_')?'thaw':'embers');
      englishOnly(campaignScreenHTML(missionProgress, index));
      const state = createGame({ mission: CAMPAIGN_MISSIONS[index].id, map: CAMPAIGN_MISSIONS[index].map, mode: 'ai' });
      for(const text of [state.map.name,...Object.values(CAMPAIGN_MISSIONS[index].unitNames??{})])expect(translate(text,'en')).not.toMatch(cyrillic);
      const before = JSON.stringify(state);
      englishOnly(campaignLessonHTML(state));
      englishOnly(campaignResultHTML({ ...state, winner: 'blue' }, missionProgress));
      englishOnly(campaignResultHTML({ ...state, winner: 'red' }, missionProgress));
      const objective = scenarioObjectiveHTML(state);
      if (objective) englishOnly(objective);
      expect(JSON.stringify(state)).toBe(before);
    }
    englishOnly(renderNewCampaignConfirmation());
    englishOnly(renderNewCampaignConfirmation(restoreCampaignProgress(null,'thaw')));
    englishOnly(campaignScreenHTML({version:2,completed:CAMPAIGN_MISSIONS.filter(m=>m.id.startsWith('thaw_')).map(m=>m.id),route:null,campaignId:'thaw'},15));
    englishOnly(renderCampaignRouteChoice({ ...progress, completed: CAMPAIGN_MISSIONS.slice(0, 6).map(m => m.id) }));
  });
  it('renders compound combat logs, preview consequences, and exits with identifiers and numbers intact', () => {
    const samples = [
      'blue-1 переместился (3 очк.) и получил 2 урона (ловушка)',
      'red-2 ударил blue-1: 3 урона, толчок (4:5), падение 2, цель погибла',
      '2 урона · отбрасывание · остановка движения до конца следующего хода цели · падение 2 · опасность 3 · контратака 1',
      'Мирон, проводник вышел к безопасному выходу',
      'Синий дозор удерживает 2 точки: 4/5',
      'Обзор закрыт бойцом red-1',
      'Объект укреплён: 4 прочности (максимум 4)',
      'Боец остановлен натиском: рывок недоступен',
      'Задание провалено: цель не выполнена за 12 раундов',
    ];
    for (const source of samples) expect(translate(source, 'en')).not.toMatch(cyrillic);
    expect(translate(samples[0], 'en')).toBe('blue-1 moved (3 points) and took 2 damage (trap)');
    expect(translate(samples[1], 'en')).toContain('red-2 struck blue-1: 3 damage, push (4:5), fall 2, target died');
  });
  it('preserves HTML identifiers, stored payload attributes, and input values', () => {
    const source = '<button id="attack" data-command="Приём" title="Прицельный выстрел" aria-label="Подтвердить атаку">Приём</button><input value="Мой отряд" placeholder="Название отряда">';
    const localized = localizedHTML(source, 'en');
    expect(localized).toContain('id="attack" data-command="Приём"');
    expect(localized).toContain('value="Мой отряд"');
    expect(localized).toContain('title="Aimed shot" aria-label="Confirm attack"');
    expect(localized).toContain('placeholder="Squad name"');
    const protectedContent = '<script>"Приём"</script><style>.Приём{}</style><textarea>Мечник</textarea><span data-user-content title="Мечник">Мой Мечник</span><span data-title="Приём">Приём</span>';
    expect(localizedHTML(protectedContent, 'en')).toBe('<script>"Приём"</script><style>.Приём{}</style><textarea>Мечник</textarea><span data-user-content title="Мечник">Мой Мечник</span><span data-title="Приём">Ability</span>');
  });
  it('has no Cyrillic in English translations and no empty source keys', () => {
    for (const [source, target] of Object.entries(ENGLISH)) {
      expect(source.length).toBeGreaterThan(0);
      expect(target).not.toMatch(cyrillic);
    }
  });
});
