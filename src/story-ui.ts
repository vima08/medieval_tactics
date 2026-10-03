import { CHARACTERS, storyScene } from './story-data';
import { unansweredChoice, type StoryProgress } from './story-progress';
import { charactersForLanguage } from './story-data';
import type { Language } from './i18n';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function storyHTML(progress:StoryProgress,reducedMotion:boolean,showLog=false,language:Language='ru'):string {
  const cursor=progress.cursor;if(!cursor)return '';
  const CHARACTERS=charactersForLanguage(language),scene=storyScene(cursor.mission,cursor.phase,progress.choices,language)!;const line=scene.lines[cursor.index],character=line.speaker?CHARACTERS[line.speaker]:null;
  const decision=line.choice&&progress.choices[line.choice.id],reply=line.choice?.options.find(o=>o.value===decision)?.reply;
  return `<section class="novel ${reducedMotion?'still':''} ${line.effect??''}" data-ambience="${scene.ambience}" aria-label="Сюжетная сцена">
    <div class="novel-art" style="background-image:url('${import.meta.env.BASE_URL}story/${scene.art}-v1.png')"></div><div class="novel-vignette"></div><div class="novel-motes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <header class="novel-header"><div><span class="eyebrow">Огни под пеплом</span><h1>${escape(scene.title)}</h1><p>${escape(scene.place)}</p></div><div class="novel-header-actions"><button class="btn ghost" id="story-log" aria-expanded="${showLog}">Журнал</button><button class="btn ghost" id="story-settings">Звук</button><button class="btn ghost" id="story-menu">Меню</button></div></header>
    <div class="novel-dialogue" style="--speaker-color:${character?.color??'#d6c798'}">
      <div class="novel-person"><div class="novel-seal ${line.speaker?'novel-portrait':''} ${line.effect==='impact'||cursor.phase==='defeat'?'tense':''}" ${line.speaker?`style="background-image:url('${import.meta.env.BASE_URL}story/portraits/${line.speaker}-${['vera','rada','tisa'].includes(line.speaker!)?'v2':'v1'}.png')"`:''} aria-hidden="true">${line.speaker?'':'✦'}</div><div><div class="novel-name">${escape(character?.name??'Хроника')}</div><div class="novel-role">${escape(character?.role??'Пограничная долина')}</div></div><div class="novel-caption"><span>${cursor.phase==='intro'?'До сражения':cursor.phase==='outro'?'После сражения':'Отступление'}</span><b>${cursor.index+1} / ${scene.lines.length}</b></div></div>
      <p class="novel-line" aria-live="polite">${escape(line.text)}</p>
      ${line.choice?`<div class="novel-choices" aria-label="Решение Верена">${line.choice.options.map(o=>`<button class="btn ${decision===o.value?'primary':'ghost'}" data-story-choice="${o.value}" ${decision?'disabled':''}>${escape(o.label)}${decision===o.value?' ✓':''}</button>`).join('')}</div><p class="novel-choice-note">${reply?escape(reply):'Это решение прозвучит в итоговом разговоре.'}</p>`:''}
      <footer class="novel-controls"><button class="btn ghost" id="story-back" ${cursor.index===0?'disabled':''}>← Назад</button><button class="btn ghost" id="story-skip" ${unansweredChoice(progress)?'disabled':''}>Пропустить сцену</button><button class="btn primary" id="story-next" ${line.choice&&!decision?'disabled':''}>${cursor.index===scene.lines.length-1?(cursor.destination==='battle'?'К сражению →':'К карте кампании →'):'Далее →'}</button></footer>
      <small class="novel-keyhint">Касание кнопок · Enter / пробел: далее · ←: назад · Esc: меню</small>
    </div>
    ${showLog?`<aside class="novel-log" aria-label="Журнал реплик"><div class="novel-log-head"><h2>Прочитанные реплики</h2><button class="btn ghost" id="story-log-close">Закрыть</button></div>${scene.lines.slice(0,cursor.index+1).map(l=>`<article><strong>${l.speaker?CHARACTERS[l.speaker].name:'Хроника'}</strong><p>${escape(l.text)}</p>${l.choice&&progress.choices[l.choice.id]?`<small>${escape(l.choice.options.find(o=>o.value===progress.choices[l.choice!.id])!.label)}</small>`:''}</article>`).join('')}</aside>`:''}
  </section>`;
}

