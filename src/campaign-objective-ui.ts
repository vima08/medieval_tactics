import type { GameState, Unit } from './engine/types';
import { campaignUnitName } from './unit-label';

type ScenarioFields={protectedIds?:string[];exits?:{x:number;y:number}[];rounds?:number;required?:number;evacuatedIds?:string[];defendedRounds?:number;defendPoints?:{x:number;y:number}[];roundLimit?:number};
const name=(u:Unit|undefined)=>u?(campaignUnitName(u)??({scout:'Разведчик',sword:'Мечник',shield:'Щитоносец',archer:'Лучник',spear:'Копейщик',engineer:'Инженер'}[u.archetype]+' '+u.id.toUpperCase())):'Боец';
export function scenarioObjectiveHTML(state:GameState):string|null {
  const o=state.objective as GameState['objective']&ScenarioFields;
  if(!['escort','evacuate','defend'].includes(o.kind))return null;
  const protectedUnits=(o.protectedIds??[]).map(id=>state.units.find(u=>u.id===id));
  const evacuated=o.evacuatedIds??[],required=o.required??protectedUnits.length;
  const status=protectedUnits.map(u=>`<span class="mission-person">${name(u)} · ${u&&evacuated.includes(u.id)?'✓ Вышел':u?.alive?u.hp+'♥':'Потерян'}</span>`).join('');
  const coords=(points:{x:number;y:number}[])=>points.map(p=>`${p.x+1}:${p.y+1}`).join(', ');
  const title=o.kind==='escort'?(state.campaignMission==='thaw_mill'?'Провести мастера':'Провести обоз'):o.kind==='evacuate'?'Вывести людей':state.campaignMission==='thaw_dike'?'Защитить дамбу':'Защитить хранилище';
  const detail=o.kind==='escort'?`Доведите отмеченных бойцов до зелёных выходов ${coords(o.exits??[])}. Гибель любого сопровождаемого — поражение.`:o.kind==='evacuate'?`Выведите ${required} отмеченных бойцов через зелёные выходы ${coords(o.exits??[])}. Вышедшие покидают поле живыми. Если спасти нужное число уже нельзя — поражение.`:`Защитите ${coords(o.defendPoints??[])} в течение ${o.rounds??o.target} полных раундов. Если враг закончит ход на отмеченной клетке — поражение. Сохраните отмеченных защитников.`;
  const progress=o.kind==='defend'?`${o.defendedRounds??0} / ${o.rounds??o.target} раундов`:`${evacuated.length} / ${required} вышли`;
  return `<div class="small-label">Задача кампании · раунд ${state.turn}/${o.roundLimit??12}</div><h3>${title}</h3><div class="statline"><span class="objective">${progress}</span></div><div class="mission-protected">${status}</div><details class="scenario-rules"><summary>Условия победы и поражения</summary><p class="tip">${detail}</p><p class="tip">Разгром врага не заменяет задачу. Завершите её до конца ${o.roundLimit??12}-го раунда.</p></details>`;
}
