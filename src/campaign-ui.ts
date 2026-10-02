import { CAMPAIGN_MISSIONS, getCampaignMission } from './engine/campaign';
import { makeMap } from './engine/maps';
import type { Archetype, GameState } from './engine/types';
import { missionUnlocked, type CampaignProgress } from './campaign-progress';

const names:Record<Archetype,string>={sword:'Мечник',archer:'Лучник',spear:'Копейщик',shield:'Щитоносец',scout:'Разведчик',engineer:'Инженер'};
const glyphs:Record<Archetype,string>={sword:'⚔',archer:'⌁',spear:'♜',shield:'⬡',scout:'➶',engineer:'⚒'};
const goals={commander:'Победить командира ♛',elimination:'Победить весь отряд',control:'Удержать сигнальные огни'};
function thumbnail(id:GameState['map']['id']){
  const map=makeMap(id),width=(map.width+map.height)*8,height=(map.width+map.height)*4+16;
  const shapes=map.tiles.map(t=>{const x=(t.x-t.y+map.height)*8,y=(t.x+t.y)*4+12-t.h*3;
    const fill=t.terrain==='water'?'#426e75':t.terrain==='bridge'?'#b0976a':t.object==='cover'?'#465047':t.h===2?'#bdc28f':t.h===1?'#92a16e':'#607957';
    return `<path d="M${x} ${y-4}l8 4l-8 4l-8 -4Z" fill="${fill}" stroke="#1a2b2466" stroke-width=".6"/>${t.object==='objective'?`<circle cx="${x}" cy="${y}" r="2.5" fill="#f9d88a"/>`:''}`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${shapes}</svg>`;
}
export function campaignScreenHTML(progress:CampaignProgress,focus:number){
  const mission=CAMPAIGN_MISSIONS[focus]??CAMPAIGN_MISSIONS[0],done=progress.completed.includes(mission.id),complete=progress.completed.length===CAMPAIGN_MISSIONS.length;
  return `<div class="campaign-screen"><header class="campaign-head"><div><div class="eyebrow">Учебная кампания · ${progress.completed.length} / 6 заданий</div><h1>Дорога шести клятв</h1><p>${complete?'Все шесть клятв исполнены. Повторите любую миссию или испытайте состав в схватке.':'Проведите дозор от зольного брода до старых печей. В каждом бою — новый союзник и новый способ управлять полем.'}</p></div><button class="btn ghost" id="campaign-menu">← Меню</button></header><div class="campaign-layout"><nav class="chapter-list" aria-label="Задания кампании">${CAMPAIGN_MISSIONS.map((m,i)=>{const unlocked=missionUnlocked(progress,i),won=progress.completed.includes(m.id);return `<button class="chapter ${focus===i?'selected':''} ${unlocked?'':'locked'}" data-mission="${i}" ${unlocked?'':'disabled'}><span class="chapter-symbol">${unlocked?glyphs[m.introduced]:'◇'}</span><span><strong>${m.title}</strong><small>${m.subtitle}</small></span><span class="chapter-status">${won?'✓':unlocked?'→':'Закрыто'}</span></button>`}).join('')}<p class="tip">Победа открывает следующее задание. Составы подготовлены для урока; в схватке доступны все классы и свободный набор.</p></nav><article class="mission-brief"><div class="mission-map">${thumbnail(mission.map)}<span>${makeMap(mission.map).width} × ${makeMap(mission.map).height} · ${goals[mission.objective]}</span></div><div class="mission-text"><div class="small-label">${done?'Пройдено · можно повторить':'Следующая клятва'}</div><h2>${mission.title}</h2><p>${mission.briefing}</p><div class="new-fighter"><span>${glyphs[mission.introduced]}</span><div><h3>Новый боец: ${names[mission.introduced]}</h3><p>${mission.lesson}</p></div></div><div class="mission-squad"><span class="small-label">Ваш дозор</span>${mission.blue.units.map(u=>`<span>${glyphs[u.archetype]} ${names[u.archetype]}</span>`).join('')}</div><div class="mission-start"><small>Цель за 12 раундов · одинаковые правила для обеих сторон<br>Шаги освоения помогают изучать приёмы; они не обязательны для победы.</small><button class="btn primary" id="campaign-start" data-id="${mission.id}">${done?'Повторить задание':'Начать задание →'}</button></div></div></article></div></div>`;
}
export function campaignLessonHTML(state:GameState){
  const mission=state.campaignMission?getCampaignMission(state.campaignMission):undefined;if(!mission)return '';
  const lessons=mission.lessonSteps.map(step=>({step,done:state.history.some(c=>'unitId'in c&&c.type===step.type&&state.units.some(u=>u.id===c.unitId&&u.team==='blue'&&(!step.archetype||u.archetype===step.archetype)))}));
  const completed=lessons.filter(l=>l.done).length,current=lessons.find(l=>!l.done);
  return `<div class="lesson-hint"><div class="small-label">Освоение: ${names[mission.introduced]} · ${completed}/${lessons.length}</div><p>${current?.step.text??'Приёмы опробованы. Завершите боевую задачу.'}</p><details><summary>Все подсказки</summary>${lessons.map(l=>`<p class="${l.done?'lesson-done':''}">${l.done?'✓':'○'} ${l.step.text}</p>`).join('')}</details><small>Цель обязательна; подсказки — для практики. Раунд ${state.turn}/12.</small></div>`;
}
export function campaignResultHTML(state:GameState){
  const index=CAMPAIGN_MISSIONS.findIndex(m=>m.id===state.campaignMission),mission=CAMPAIGN_MISSIONS[index],won=state.winner==='blue',next=CAMPAIGN_MISSIONS[index+1];
  return `<div class="modal-back"><div class="modal"><div class="eyebrow">${mission?.title??'Кампания'}</div><h1>${won?(next?'Клятва исполнена':'Дозор вернулся'):'Задание не выполнено'}</h1><p>${won?(next?`Следующая клятва: ${next.title}. К дозору присоединится ${names[next.introduced].toLowerCase()}.`:'Кампания завершена. Вы познакомились со всеми шестью классами.'):'Попробуйте другой порядок действий и проверьте угрозы перед завершением хода.'}</p><div class="menu-actions">${won&&next?`<button class="btn primary" data-modal="campaign-next" data-id="${next.id}">Следующее задание →</button>`:''}<button class="btn ${won?'ghost':'primary'}" data-modal="restart">Повторить задание</button><button class="btn ghost" data-modal="campaign">Карта кампании</button><button class="btn ghost" data-modal="menu">В меню</button></div></div></div>`;
}
