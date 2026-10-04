import type { Character, CharacterId, SceneData, StoryLine, StoryPhase } from './story-data';
export const ENGLISH_CHARACTERS:Record<CharacterId,Character>={
  vera:{name:'Veren',role:'Patrol commander',color:'#a7cec0',symbol:'⚔'},
  ilya:{name:'Ilya',role:'Signal tower keeper',color:'#d6bc7b',symbol:'⌁'},
  rada:{name:'Radomir',role:'Militia spearman',color:'#cba08a',symbol:'♜'},
  bor:{name:'Bor',role:'Old road guard',color:'#abb8c6',symbol:'⬡'},
  tisa:{name:'Tikhon',role:'Reed trail scout',color:'#bdc88e',symbol:'➶'},
  savva:{name:'Savva',role:'Kiln engineer',color:'#d5a575',symbol:'⚒'},
};
const n=(text:string,effect?:StoryLine['effect']):StoryLine=>({text,effect});
const s=(speaker:CharacterId,text:string,effect?:StoryLine['effect']):StoryLine=>({speaker,text,effect});
export const ENGLISH_SCENES:Record<string,SceneData>={
  ford:{title:'The missing caravan',place:'Ash Ford · evening of the first day',ambience:'river',art:'river',intro:[
    n('No cart has arrived from the northern villages in three days. The patrol finds an abandoned harness by the river, with blood on the planks.'),
    s('vera','Our orders are to open the ford. We take the commander off the crossing first, then find out where they took the drivers.'),
    n('Veren shows the governor’s seal on his orders. The soldiers across the river wear the same seal on their sleeves.'),
    s('vera','They are our soldiers. Leave anyone who lays down his weapon alone. But I will not send the whole patrol through the water to cut off their retreat.'),
    n('An arrow flies from the far bank. It pierces the map beside Veren’s hand.','impact'),
  ],outro:[
    n('The checkpoint commander carries a list of barns and confiscation receipts. A letter to a merchant names the price: the grain has already been promised for silver.'),
    s('vera','My orders say winter reserve. This gives a price for every sack. Someone is selling what we were sent to protect.'),
    s('ilya','I keep the tower. Yesterday they used its signal to close the road. My assistant refused to light the bowl. They took him away.'),
    s('vera','Show us the approach. We take the letter with us. Without it, they will say we attacked our own checkpoint.'),
  ],defeat:[
    n('The patrol retreats behind the river bend. The governor’s soldiers hold the crossing; the cart drivers cannot get home.'),
    s('vera','Get the wounded onto dry ground. I brought you too close to their archers. I will check the next approach myself.'),
  ]},
  watch:{title:'Orders to close the road',place:'Watch Terrace · morning',ambience:'heights',art:'river',intro:[
    s('ilya','Two short fires open the road. One long fire closes it. They ordered the long signal while families were still climbing toward the gates.'),
    s('vera','And you obeyed?'),
    s('ilya','Yes. Then I saw the guards send them back into the cold. I put the fire out. Another crew holds the tower now.'),
    n('Ilya takes the upper ledge. Veren moves toward the stairs: the guard commander holds the lower approach to the tower.'),
  ],outro:[
    s('ilya','Here are the orders. The governor’s signature, number and date. Cut off the villages until they surrender their entire reserve.'),
    s('vera','I told my men we were stopping raiders. They used us to guard a robbery.'),
    s('rada','Then hear me out. My father was left at the steps. Their chief took our cart and would not let him reach a healer.'),
    s('ilya','I am coming with you. Those fires were my responsibility. Nobody else can testify for me.','bell'),
  ],defeat:[
    n('The guards light the long signal again. On the lower road, families turn their carts around.'),
    s('ilya','I saw a way around from the ledge, but warned you too late. Let me bind this arm. I will lead you there when we return.'),
  ]},
  steps:{title:'A receipt for an empty cart',place:'Stone Steps · midday',ambience:'heights',art:'river',intro:[
    s('rada','Father died beyond those stairs. They gave me a grain receipt and told me to collect his body. Their chief is still up there.'),
    s('vera','Radomir, if he surrenders, we take him to trial. I need a living witness.'),
    s('rada','I needed a living father. I will hold formation, but do not ask me to pity that man.'),
    s('ilya','Archers above us. Radomir, your spear reaches past the first rank. I will cover the stairs on the right.'),
    n('The chief orders the portcullis lowered. The patrol climbs while the passage is still open.','impact'),
  ],outro:[
    s('rada','Our cart is in the ledger twice. Once for the reserve, once for sale. They robbed us and collected payment for it.'),
    s('vera','We take the ledger and the receipt. Bor is at the gates. He can confirm which caravans passed through.'),
    s('rada','He let them through. If he says he saw nothing, I will not believe him.'),
    n('Radomir wraps his father’s receipt in dry cloth. Veren adds his name to the witness list.'),
  ],defeat:[
    n('The portcullis closes. The patrol carries its wounded down the lower stairs; the ledger stays at the checkpoint.'),
    s('rada','I rushed their chief and broke formation. Next time I stay beside you. But we are going back for that book.'),
  ]},
  gate:{title:'Open the gates',place:'Patrol Gates · sunset',ambience:'heights',art:'river',intro:[
    s('bor','I let the grain carts through and turned families back. I saw the orders. I did not know about the sale, but that does not excuse me.'),
    s('vera','Help us open the road. We must hold both signal posts, or the other checkpoints will close again.'),
    s('bor','I will. But the chief promised to arrest anyone who touches the bowls. My son is beyond these gates.'),
    {...s('vera','What orders do we send the other checkpoints?'),choice:{id:'signal',options:[
      {value:'people',label:'Open the road to families',reply:'Send it openly: let families through. The governor will know who revoked his orders. I will sign my name.'},
      {value:'orders',label:'Open the road for a reserve inspection',reply:'Say the patrol is inspecting the reserve. It buys time, but the soldiers will expect confirmation. I will answer for the lie.'},
    ]}},
    s('bor','Hold both fires. I will cover the posts with my shield. If they arrest my son, put him on the witness list too.'),
  ],outro:[
    n('Both posts send short fires. Bor lifts the bar, and the first cart passes through the gates.','bell'),
    s('bor','My signature is beside every caravan in the guard ledger. Take it. Leave in the pages that show what I did.'),
    s('rada','We will take it. Right now, go to the rear carts. Those are the people you turned back yesterday.'),
    s('vera','The next store is at the kilns. If the warning gets there first, they will burn the papers and lock up the workers.'),
  ],defeat:[
    n('One post goes dark. The gates close again, leaving the families outside the wall.'),
    s('bor','My shield cannot cover two posts at once. Split the patrol before we climb. Check who is guarding each fire.'),
  ]},
  marsh:{title:'The worker list',place:'Reed Trail · night',ambience:'marsh',art:'river',intro:[
    s('tisa','They will see us on the bridge. I brought my brother along the lower trail a week ago. There is a trap there now, but we can still go around.'),
    s('vera','Your brother works at the kilns?'),
    s('tisa','Miron. A cart driver. They promised a day’s pay, then locked the gates. If they moved him, the commander should have a list.'),
    s('rada','I will take the first rank. Go around the side, but do not cross the bridge alone.'),
    s('tisa','I see a tripwire by the water. I can jump it. Take everyone else uphill; I cannot make that jump carrying a wounded man.'),
  ],outro:[
    n('Tikhon takes the keys from the commander’s belt and reads the transfer sheet. Its margins record punishments for trying to leave.'),
    s('tisa','Miron is at the last kiln. They broke his fingers for asking to go home. I want to find whoever did it.'),
    s('ilya','They dry the grain there. They need workers before they can sell the reserve. While the kilns are smoking, we may still get there in time.'),
    s('vera','Clear the yard and open the doors. The workers are unarmed. Do not shoot anyone running out of the building.'),
  ],defeat:[
    n('The patrol is forced away from the trail. Beyond the marsh, smoke still rises from the kilns.'),
    s('tisa','They are holding Miron there. I will not go alone. If they catch me, you lose your guide. We rest, then check the upper approach.'),
  ]},
  kiln:{title:'The last kiln’s doors',place:'Old Kilns · before dawn',ambience:'kiln',art:'kiln',intro:[
    n('The patrol sees a locked barracks and carts beside the store. In the yard, soldiers pour oil over bundles of papers.','ember'),
    s('savva','I built these kilns. Their chief ordered me to lock the workers in. When I refused, he put soldiers at the doors.'),
    s('vera','Savva, where is the barracks key?'),
    s('savva','The yard commander has it. Take him down and I will break the lock. I can destroy a bridge or cover, but move our men off it first.'),
    s('tisa','My brother is inside. If they set fire to the barracks, I am going to that door. Cover me, even if it ruins your plan.'),
  ],outro:[
    n('Savva breaks the lock. Miron comes out first, his fingers bandaged. Tikhon embraces his younger brother and checks for fresh blood.','ember'),
    s('savva','The granary holds seed grain for the whole valley. The guards fell back, but the governor still has another force. We cannot hold the store and the road.'),
    s('rada','Did you find the order to sell the grain?'),
    s('vera','Yes. The governor’s seal, the price and the buyer’s name. Oleg, the store clerk, can confirm the signature. Miron saw the loading.'),
    s('bor','We can take the families out with the northern caravan. If we go there, the granary loses our shields.'),
    s('ilya','If we protect the grain, the caravan gets guides. There are ambushes on that road. A signal cannot save them from those.'),
    s('vera','We choose one route. My report will name the decision and its cost. That will not be enough for the families we leave unguarded. I understand that.'),
    n('Outside the kilns, the wounded gather and the last blankets are shared out. Miron prepares a cart; Savva checks the granary door. There is no time to wait for help.'),
  ],defeat:[
    n('The patrol leaves the yard under arrow fire. The barracks door remains locked; Savva takes away a drawing of its lock.'),
    s('vera','Tikhon, I promised to bring your brother out and failed. We will return. First we find an approach they cannot shoot from both sides.'),
  ]},
  caravan:{title:'Guarding the northern caravan',place:'Northern Road · first snow',ambience:'river',art:'caravan',intro:[
    n('Veren sends the shields to the caravan. Only workers remain at the seed store. Savva records how much grain they must leave behind.'),
    s('tisa','Miron will drive the front cart. His fingers are bandaged; I will check the bends so he does not have to turn the horses under fire.'),
    s('rada','My uncle is in the rear cart. He cannot walk. If the horse goes down, two of us will have to carry him.'),
    s('bor','I will cover the rear cart. Yesterday I kept them outside the gates. Today I can at least do this.'),
    s('vera','Miron must reach the marked exit. Keep him moving and cover his route. Killing the commander does not complete the escort.'),
    n('A felled pine blocks the next bend. The governor’s soldiers emerge from the trees.','impact'),
  ],outro:[
    n('Miron crosses the boundary stone. The last cart follows. Radomir helps his uncle down and counts everyone against the manifest.'),
    s('tisa','Everyone who left the kilns with us is here. Miron, sit down. You held those reins all the way with broken fingers.'),
    s('savva','The granary is burning. We have a few sacks left from the whole reserve. We got the people out, but the food will not last the winter.'),
    s('vera','The neighbours will want proof before they give us grain. Until we reach the council, we record every ration, including mine.'),
    s('rada','Then tell people today. Do not wait until they ask for a second ladle and you order them to endure it.'),
  ],defeat:[
    n('The caravan did not reach the exit. Broken carts remain on the road; the patrol failed to cover the lead team.'),
    s('vera','We left the driver exposed. We start again: the shields stay beside the lead cart.'),
  ]},
  granary:{title:'Four rounds at the granary',place:'Winter Granary · first snow',ambience:'kiln',art:'granary',intro:[
    n('The shields head to the granary. The northern caravan leaves with guides. Radomir asks Veren to record the names of those sent out without guards.'),
    s('savva','They want to burn the seed reserve to hide the sale. Hold the store while I reinforce the gate.'),
    s('bor','Here I am at a locked door again, with families outside. Veren, we know what awaits them on that road.'),
    s('vera','We know. We also know the villages cannot sow in spring without seed. I chose the granary. I will not claim that saves everyone.'),
    s('ilya','I will signal an open passage for the caravan. But if they walk into an ambush, our fire will not stop it.'),
    s('savva','Cover me and hold the marked gate for four full rounds. Do not let an enemy onto it. Defeating their commander does not replace holding the store.'),
  ],outro:[
    n('Savva secures the final beam. Axes have scarred the door, but the sacks inside are intact. Bor and Radomir check the inventory together.'),
    s('savva','The reserve is safe. There is enough for sowing. We can eat only what remains after that calculation, and every village must hear the figures.'),
    s('tisa','Miron brought the front carts through. The rear one is missing. Radomir’s uncle and two drivers were in it. I am going to look.'),
    s('vera','We go together. I ordered us to protect the store. If they are dead, the report will say why they had no shields.'),
    s('bor','I take one key, Radomir takes the other. We will not entrust the whole reserve to one man again.'),
  ],defeat:[
    n('The work at the gate was not finished. The granary’s defence failed; unsecured beams lie on the ground.'),
    s('vera','We failed to hold the granary for four full rounds. Next time we cover the engineer and both approaches.'),
  ]},
  evacuation:{title:'Witnesses on the pass',place:'Snow Saddle · dusk',ambience:'heights',art:'caravan',intro:[
    n('Both routes meet at the pass. The governor has ordered the witnesses detained: Miron, who saw the grain loaded, and Oleg, the clerk who kept the shipping records.'),
    s('tisa','Snow has blocked the other trail. This passage leads to the marked exits. I will take my brother and Oleg through it.'),
    s('rada','Oleg fears prison for the false entries. Let him say what he signed. If we hide our own guilt, his testimony falls apart.'),
    s('ilya','I will take the ledge. I can see the whole passage. Warn me when the witnesses leave cover.'),
    s('vera','Both Miron and Oleg must reach the marked exits. They leave the field there. Everyone else holds the passage until the second witness is out.'),
  ],outro:[
    n('Miron and Oleg cross the border. Bor withdraws last, carrying a broken shield. Ilya extinguishes the lower bowl so the pursuers cannot see the trail.'),
    s('bor','The checkpoint took in the wounded. They gave my son a blanket. He asked why I had not given one to the others.'),
    s('vera','The governor has blocked the stairs to the council. The witnesses are under guard at the neighbouring checkpoint. We clear their way to the hearing.'),
    s('savva','I will tell them about the grain and the kilns I built for him. It would be easier to leave out my own work. But we asked Oleg to tell everything.'),
  ],defeat:[
    n('Both witnesses could not be brought out. The governor’s soldiers prevented their passage to the council, and their testimony was never heard.'),
    s('vera','The papers alone are not enough. We must bring both men through; the next crossing begins under cover.'),
  ]},
  summit:{title:'Testimony before the council',place:'Council House · winter dawn',ambience:'heights',art:'ending',intro:[
    n('The governor declares the patrol rebels. His commander holds the stairs to the council house, where representatives of the villages and neighbouring valleys wait.'),
    s('vera','He seized the grain, sold part of it to a merchant and locked up the workers. Now he demands the witnesses. There will be no order to retreat.'),
    s('ilya','I will light two short fires. Let the council see we are here. The guards cannot tell them nobody came.'),
    s('bor','I take the first blow on my shield. But leave soldiers who surrender alone. Some obeyed orders, as I did.'),
    s('rada','We take the commander off the stairs. Then I tell them about my father, and Veren tells them about the caravan. They hear the things that trouble us too.'),
    s('vera','I will. Follow me. The witnesses need a clear passage.'),
  ],outro:[
    n('The commander falls and the guards withdraw. The council compares the merchant’s letter, shipping records and testimony. The governor is detained pending trial; his seal and accounts are seized.'),
    s('vera','I will submit my own report separately. Revoking criminal orders does not clear me of responsibility for the people we left unguarded.'),
  ],defeat:[
    n('The commander holds the stairs. The witnesses remain protected at the pass, but the council still has no documents.'),
    s('vera','We cannot lose the papers in the last attack. Leave copies with Oleg. Once the wounded are bandaged, we return and take the commander off those stairs.'),
  ]},
};
Object.assign(ENGLISH_SCENES,{
  thaw_dike:{title:'Water above the mark',place:'Clay Dike · day one',ambience:'river',art:'river',intro:[
    n('Spring arrives before sowing. Water at the lower dike rose a handspan overnight. The villagers ask the patrol to take a craftsman to the sluice.'),
    s('savva','Another day and it will flow over the clay. We must open the upper channel. Its guards demand a share of every sack we have yet to harvest.'),
    s('bor','The governor is on trial, but his collectors stayed. They call it a repair fee now.'),
    s('vera','The council asked us to protect the workers. I no longer command by a sealed order. Every man here knows why he carries a weapon.'),
    n('Collectors approach the dike gate. While Savva checks the supports, the patrol blocks their way.','impact'),
  ],outro:[s('savva','The supports held. But we cannot stop the water here. The main gate is above the mill.'),s('rada','They promised the farmers water after winter. Instead, they bring another bill.'),s('vera','First we get Savva through. Then we find out who signed it. If repairs are real, the council pays the workers, not a hungry village.')],defeat:[n('The patrol leaves the gate. The repair is unfinished; water reaches the lower houses.'),s('bor','Keep that gate covered next time. Shield in front, spear behind. The workers need a full round without fighting.') ]},
  thaw_mill:{title:'Someone else’s key',place:'Mill Channel · day two',ambience:'river',art:'river',intro:[
    n('Two crossings stand beside the mill. Flour went over the upper bridge; the lower crossing was laid with stone before the war.'),
    s('savva','Timofey, the millwright, sent me his key. They are holding him in the upper guardhouse because he refused to collect the toll.'),
    s('ilya','The guards say the fee pays for sluice repairs. But the mill has stopped. They have not even begun.'),
    s('vera','Savva, get to the workshop across the river. We cover both bridges. First we release the water, then settle the accounts.'),
  ],outro:[n('Savva enters the workshop. Timofey left a drawing: the lower villages are flooding because the upper gate is locked.'),s('savva','The gate works. Open it now and the lower dike holds. Wait two more days and we must cut through the banks.'),s('ilya','We must warn all three villages. They will not see a fire through this fog. The bell towers still stand.')],defeat:[n('The guards keep the workshop. The key never reaches the eastern bank.'),s('vera','We spread our cover too thin. Choose one road for the craftsman; use the other to flank them.') ]},
  thaw_bells:{title:'A warning for the lowlands',place:'Three Bell Towers · day three',ambience:'heights',art:'ending',intro:[
    s('ilya','The first bell reaches the mill. The second reaches the floodplain. The third carries beyond the woods. Hold any two; the villagers relay the warning. A single bell sounds like a fire.'),
    s('rada','The guards hold the towers. While we argue over bills, water is already in the houses.'),
    s('bor','Five of us for three posts. I will stand between them. Do not rush the far bell before the shield covers the crossing.'),
    n('Ilya gives Veren three knotted cords: the villagers’ sign that the warning comes from the patrol.','bell'),
  ],outro:[n('The bells answer one another. Villagers relay the warning at the third tower. Lanterns appear on the lower road as families leave for the dry woods.'),s('ilya','This time nobody waits for an officer’s permission. The villagers will pass the warning themselves.'),s('tisa','Miron and Oleg the ferryman stayed behind. They counted everyone who crossed. We must fetch them tonight, or the guards will list the missing as people who chose to leave.')],defeat:[n('Separate bell strokes disappear in the wind. The lower villages do not hear a shared warning.'),s('ilya','Taking one tower is not enough. Hold at least two and ring together. I will repeat the order to every man.') ]},
  thaw_ferry:{title:'The last ferry',place:'Floodplain · the fourth night',ambience:'marsh',art:'caravan',intro:[
    s('tisa','Miron stayed to count people at the ferry. Oleg held the boat while the children got out. Now both roads are blocked.'),
    s('bor','Fresh cuts in the upper bridge. They mean to drop it behind their guards. The lower ford still holds.'),
    s('vera','Bring both men to the eastern exits. Their lists belong to the families. No chasing anyone who drops his weapon.'),
    n('An axe strikes a bridge beam somewhere in the fog. Before dawn, the river will rise again.','impact'),
  ],outro:[n('Oleg and Miron reach the dry road. Their lists hold fifty-three names; boat crews are still searching for three people.'),s('tisa','Miron wanted to go straight back. I took his oar. After half a day in icy water he can barely stand.'),s('vera','Let fresh crews take the search. We need stone for the lower dike. Without it, the people we saved have no homes to return to.')],defeat:[n('The patrol cannot bring both ferrymen out. Fog hides the eastern road.'),s('vera','Check both routes before the next attempt. The cover leaves last, not first.') ]},
  thaw_quarry:{title:'Stone against a receipt',place:'Old Quarry · day five',ambience:'kiln',art:'kiln',intro:[
    s('savva','The masons will sell us blocks. But an armed crew locked the hoist. They demand payment for the right to work.'),
    s('rada','They will say we are taking what belongs to others again. Like the grain in winter.'),
    s('vera','We buy stone from the men who cut it. Savva wrote down the price; the council gave us silver. The workers keep the receipt. The guards get no share for threatening them.'),
    s('ilya','An archer on the upper ledge. Two approaches: hold one with the shield, let Tikhon flank along the other.'),
  ],outro:[n('The workers load the stone and count the silver before witnesses. Each receipt carries two signatures.'),s('savva','The dike will be repaired tonight. We can open the sluice without washing away the lower houses.'),s('bor','The upper dam’s officer refused. He says water belongs to whoever holds the key. I know him. I appointed him to the guard.')],defeat:[n('The hoist remains locked. The carts return to the dike without stone.'),s('rada','They stopped us on the first stair. Choose another approach or the archer will break our formation from above again.') ]},
  thaw_sluice:{title:'The right to release the river',place:'Upper Sluice · day six',ambience:'heights',art:'ending',intro:[
    s('bor','Their officer was my pupil. I taught him to guard the key, not ask why the gate was shut. Now he says questions come too late.'),
    s('vera','They do not. He can lay down his weapon today. But no one man will close the river to three villages with his signature again.'),
    s('savva','The stone is laid. Once we remove the guards, I open the gate mark by mark. Not all at once, or the pressure tears out the new bank.'),
    n('The officer takes the upper ledge. A golden crown marks his banner; the patrol’s shieldbearer remains the commander of its formation.','bell'),
  ],outro:[n('They open the gate one mark at a time. By evening, water leaves the doorsteps and returns to the irrigation channel.'),s('bor','The officer will face the council. I will testify about how I trained his guards. I will not blame everything on one bad pupil.'),s('rada','The workers were paid. So we can manage without charging every field. Put that in the book too.'),s('savva','Three keys now: one for each village. Repair money is set aside openly after harvest. If one post falls silent, the others ring their bells.'),n('The patrol helps sow the drying floodplain. Grain that survived the war falls into the first furrow. Now they count the days to green shoots, rather than the next order.','bell')],defeat:[n('The guards keep the upper sluice. Water remains above the lower dike; there is little time for another approach.'),s('savva','The dam has not fallen. Check both bridges and try again. Keep our commander out of the archer’s fire on the upper ledge.') ]},
} satisfies Record<string,SceneData>);
export function englishConsequences(mission:string,phase:StoryPhase,choices:Record<string,string>,lines:StoryLine[]){
  if(mission==='gate'&&phase==='outro')lines.splice(1,0,s('ilya',choices.signal==='people'?'The neighbouring gates opened. But the governor knows Veren’s name now. Bor, tell your son to leave with the caravan.':'The neighbouring checkpoints accepted the inspection signal. We have until they check it. If we take too long, the gates close again.'));
  if(mission==='kiln'&&phase==='outro')lines.splice(6,0,s('vera',choices.signal==='people'?'We promised to open the road to families. They came because of our signal. If we leave their caravan without shields, we owe them an answer.':'We called this a reserve inspection. We have the papers now, but the false signal goes into my report too.'));
  const caravan=choices.route==='caravan';
  if(mission==='evacuation'&&phase!=='defeat')lines.splice(1,0,s('rada',caravan?(phase==='intro'?'My uncle is with the caravan. All the carts are intact; food will last a few days. We need living witnesses, or we cannot prove to the neighbours that the reserve was burned.':'Every cart is through. Tomorrow we announce the small rations. My uncle is already asking how long they will last. I will not invent an answer.'):(phase==='intro'?'The reserve is secured at the store. Tikhon found tracks from the rear cart. Once the witnesses are out, we will check the ravine.':'We found the rear cart in the ravine. Both drivers and my uncle froze to death. Their names will be read to the council too.')));
  if(mission==='summit'&&phase==='intro')lines.splice(2,0,s('savva',caravan?'The granary burned. We must ask our neighbours for grain. The council must see the accounts so the aid does not become another secret deal.':'The seed is safe. But three people died on the road without our protection. The sacks do not remove them from the report.'));
  if(mission==='summit'&&phase==='outro')lines.push(...(caravan?[
    n('Epilogue · A winter of small rations. The council publishes the accounts and arranges grain from its neighbours in exchange for kiln repairs. The governor stands trial for confiscations, selling the reserve and imprisoning workers.'),
    s('rada','My uncle is alive. But we ate once a day all winter, and had to borrow seed for sowing. People have the right to ask why we left the granary unguarded.'),
    s('bor','I testified and lost my position as gate chief. I serve in the guard under someone else now. They kept the ledger with my signatures.'),
    s('tisa','Miron drives a cart again. Two fingers will not bend. He wants payment before departure now, and checks the contract himself.'),
    n('Veren hands over command until his report is examined. At the spring meeting, the loan terms and grain expenses are read aloud. Every village has a copy and can demand an audit without the patrol’s permission.','bell'),
  ]:[
    n('Epilogue · Sowing and burials. The council allocates seed by the number of fields and publishes the inventory. The governor stands trial for confiscations, selling the reserve and imprisoning workers.'),
    s('savva','The villages received the grain. The store has two keys, and we record every issue with witnesses present. I used my wages to repay the workers’ pay that the chief withheld.'),
    s('tisa','We buried the drivers and Radomir’s uncle. Miron knows their carts by the cuts in the wood. I will not ask Radomir to celebrate the harvest.'),
    s('vera','I handed over command. The bereaved families received my report before the council did. If they demand a trial over my decision, I will attend.'),
    n('At the spring meeting, three names are read before the sowing inventory. Radomir remains one of the key holders. Residents of any village may demand an inspection of the reserve.','bell'),
  ]));
}
