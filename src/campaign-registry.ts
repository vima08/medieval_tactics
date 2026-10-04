export type CampaignId='embers'|'thaw';
export type CampaignDefinition={id:CampaignId;title:string;subtitle:string;description:string;missionIds:string[];length:number;finalMission:string};
export const CAMPAIGNS:CampaignDefinition[]=[
  {id:'embers',title:'Огни под пеплом',subtitle:'Дорога через зиму',description:'Дозор раскрывает продажу зимнего запаса. Девять заданий, шесть бойцов и выбор между спасением людей и семян.',missionIds:['ford','watch','steps','gate','marsh','kiln','caravan','granary','evacuation','summit'],length:9,finalMission:'summit'},
  {id:'thaw',title:'Колокола оттепели',subtitle:'Шесть дней до посева',description:'Весенний паводок угрожает деревням. Проведите мастера к мельнице, удержите дамбу и решите, кто вправе распоряжаться водой.',missionIds:['thaw_dike','thaw_mill','thaw_bells','thaw_ferry','thaw_quarry','thaw_sluice'],length:6,finalMission:'thaw_sluice'},
];
export const getCampaign=(id:CampaignId='embers'):CampaignDefinition=>CAMPAIGNS.find(c=>c.id===id)??CAMPAIGNS[0];
export const missionCampaignId=(id:string):CampaignId=>CAMPAIGNS.find(c=>c.missionIds.includes(id))?.id??'embers';
