import type { Archetype, Blueprint, GameMap, ObjectiveKind } from './types';

export type CampaignMission = {
  id: string;
  map: GameMap['id'];
  title: string;
  subtitle: string;
  briefing: string;
  lesson: string;
  introduced: Archetype;
  objective: ObjectiveKind;
  target: number;
  blue: Blueprint;
  red: Blueprint;
  spawns: { blue: {x:number;y:number}[]; red: {x:number;y:number}[] };
  lessonSteps: { text: string; type: 'move' | 'attack' | 'ability'; archetype?: Archetype }[];
};

const squad = (name: string, ...classes: Archetype[]): Blueprint => ({ name, units: classes.map(archetype => ({ archetype, variant: '' })) });

/** Fixed armies teach one new geometry at a time; no hidden stat bonuses. */
export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id:'ford', map:'ford', title:'I · Зольный брод', subtitle:'Мечник · соседняя клетка и толчок', introduced:'sword', objective:'commander', target:1,
    briefing:'Дозор потерял связь с деревней за рекой. Сбейте главаря с брода: его падение завершит бой. Золотой венец отмечает командира.',
    lesson:'Мечник двигается на 4 клетки и бьёт рядом на 3 урона. Толчок наносит 2 урона и сдвигает цель. Если за целью вода или препятствие, столкновение наносит ещё 1 урон.',
    blue:squad('Первый дозор','sword','sword'), red:squad('Разбойник брода','sword'),
    spawns:{blue:[{x:2,y:3},{x:2,y:5}],red:[{x:5,y:3}]},
    lessonSteps:[{text:'Подойдите к броду. Перемещение можно отменить до удара.',type:'move',archetype:'sword'},{text:'Ударьте соседнего врага — результат показан до клика.',type:'attack',archetype:'sword'},{text:'Попробуйте толчок; проверьте конечную клетку цели.',type:'ability',archetype:'sword'}],
  },
  {
    id:'watch', map:'watch', title:'II · Сторожевая терраса', subtitle:'Лучник · обзор и высота', introduced:'archer', objective:'elimination', target:1,
    briefing:'Враг занял каменную террасу. Очистите её двумя бойцами. Лучник уже стоит наверху, мечник прикрывает нижний подход.',
    lesson:'Лучник стреляет на 2–6 клеток по чистой линии. Высота даёт +1 урон; нельзя стрелять по соседнему врагу. Укрытие и бойцы закрывают обзор.',
    blue:squad('Стрелковый дозор','sword','archer'),red:squad('Сторожевая шайка','sword','sword'),
    spawns:{blue:[{x:3,y:5},{x:3,y:3}],red:[{x:6,y:4},{x:7,y:5}]},
    lessonSteps:[{text:'Переместите мечника к нижнему подходу.',type:'move',archetype:'sword'},{text:'Выстрелите с террасы: проверьте бонус высоты.',type:'attack',archetype:'archer'},{text:'Прицельный выстрел добавляет 1 урон и запрещает движение.',type:'ability',archetype:'archer'}],
  },
  {
    id:'steps',map:'steps',title:'III · Копейные ступени',subtitle:'Копейщик · удар через союзника',introduced:'spear',objective:'commander',target:1,
    briefing:'Главарь укрылся за своими людьми у лестницы. Мечник держит проход, копейщик атакует из второго ряда, лучник ловит обходящих.',
    lesson:'Копьё бьёт на 1–2 клетки только по прямой и проходит через союзника. Натиск отбрасывает и останавливает цель. Расставьте строй перед ударом.',
    blue:squad('Строй дозора','sword','archer','spear'),red:squad('Стража лестницы','spear','sword'),
    spawns:{blue:[{x:3,y:3},{x:2,y:5},{x:2,y:3}],red:[{x:6,y:3},{x:5,y:3}]},
    lessonSteps:[{text:'Передвиньте мечника в проход.',type:'move',archetype:'sword'},{text:'Ударьте копьём по прямой через своего бойца.',type:'attack',archetype:'spear'},{text:'Натиск остановит движение цели и столкнёт её со ступени.',type:'ability',archetype:'spear'}],
  },
  {
    id:'gate',map:'gate',title:'IV · Ворота дозора',subtitle:'Щитоносец · прикрытие и удержание',introduced:'shield',objective:'control',target:2,
    briefing:'Захватите оба знамени у ворот на два полных круга подряд. При потере контроля серия сбрасывается. Щитоносец прикрывает соседей, пока они занимают точки.',
    lesson:'Соседство со щитоносцем снижает входящий урон союзнику на 1. Стража дополнительно защищает самого щитоносца до следующего хода. Он медленный — выдвиньте его первым.',
    blue:squad('Стражи ворот','shield','sword','archer','spear'),red:squad('Вражеский дозор','sword','archer','spear'),
    spawns:{blue:[{x:3,y:3},{x:3,y:5},{x:2,y:4},{x:2,y:3}],red:[{x:7,y:3},{x:8,y:4},{x:7,y:5}]},
    lessonSteps:[{text:'Подведите щитоносца к союзнику на точке.',type:'move',archetype:'shield'},{text:'Включите стражу перед ответным ходом.',type:'ability',archetype:'shield'},{text:'Прикрываемый союзник атакует из защищённой позиции.',type:'attack',archetype:'spear'}],
  },
  {
    id:'marsh',map:'marsh',title:'V · Тропа в тростниках',subtitle:'Разведчик · обход и выход из боя',introduced:'scout',objective:'commander',target:1,
    briefing:'Командир ведёт стрелков по верхнему мосту. Обойдите его через нижний брод или пробейтесь прямо. Ловушка на нижней тропе наносит урон, если закончить на ней движение. Завершите шаг за ней или перепрыгните её рывком.',
    lesson:'Разведчик проходит 5 клеток, но имеет только 4 здоровья. Он получает +1 урон во фланг цели рядом с союзником. Вместо удара он может сделать рывок на свободную клетку в двух шагах, перепрыгнув занятую клетку.',
    blue:squad('Тростниковый дозор','shield','sword','archer','spear','scout'),red:squad('Охрана командира','archer','shield','sword'),
    spawns:{blue:[{x:3,y:2},{x:2,y:3},{x:2,y:1},{x:2,y:2},{x:3,y:6}],red:[{x:8,y:2},{x:7,y:2},{x:8,y:5}]},
    lessonSteps:[{text:'Обойдите строй по нижней тропе. Не заканчивайте движение на ловушке.',type:'move',archetype:'scout'},{text:'Атакуйте цель, которую уже связывает союзник.',type:'attack',archetype:'scout'},{text:'В другом ходу используйте рывок на свободную клетку в двух шагах.',type:'ability',archetype:'scout'}],
  },
  {
    id:'kiln',map:'kiln',title:'VI · Последняя печь',subtitle:'Инженер · ловушки и хрупкие мосты',introduced:'engineer',objective:'elimination',target:1,
    briefing:'Последний отряд заперся у старых печей. Победите всех защитников. Инженер может расчистить укрытие ударом или подорвать соседний мост вместе с врагом.',
    lesson:'Инженер стреляет на 3 клетки, но наносит мало урона. Его сила — окружение: ломайте укрытия, ставьте ловушки на пустой соседней клетке и подрывайте хрупкие мосты. Два моста дают разные маршруты.',
    blue:squad('Дозор печи','sword','archer','spear','scout','engineer'),red:squad('Защитники печи','shield','sword','archer','engineer'),
    spawns:{blue:[{x:4,y:3},{x:3,y:2},{x:3,y:3},{x:3,y:8},{x:4,y:4}],red:[{x:7,y:3},{x:7,y:7},{x:9,y:6},{x:8,y:7}]},
    lessonSteps:[{text:'Подведите инженера к хрупкому мосту.',type:'move',archetype:'engineer'},{text:'Ударьте по врагу или разрушаемому укрытию.',type:'attack',archetype:'engineer'},{text:'Поставьте ловушку или подорвите соседний мост.',type:'ability',archetype:'engineer'}],
  },
];

export function getCampaignMission(id: string): CampaignMission | undefined { return CAMPAIGN_MISSIONS.find(m => m.id === id); }
