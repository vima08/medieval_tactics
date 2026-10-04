/** Russian source text → English presentation. Longest phrases are matched first. */
export const ENGLISH: Record<string, string> = Object.fromEntries(`
Тактическое поле: стрелки выбирают клетку|Tactical field: arrow keys select a tile
Пройдено:|Completed:
перетаскивание / WASD|drag / WASD
Стрелки выбирают клетку даже за бойцом. Home возвращает прицел к выбранному бойцу. Enter подтверждает приказ в прицеле; без прицела завершает ход. Ctrl + Enter всегда завершает ход. Подсветка и точный прогноз обновляются до подтверждения.|Arrow keys select a tile even behind a fighter. Home returns the aim to the selected fighter. Enter confirms the aimed order; when aiming is inactive, it ends the turn. Ctrl + Enter always ends the turn. Highlights and the exact preview update before confirmation.
Срок каждого задания указан в панели цели; пропуск срока означает поражение. На Воротах даже уничтожение всех защитников не заменяет удержание двух точек. Точное условие всегда в панели цели.|Each mission's deadline is shown in the objective panel; missing it means defeat. At the Gates, defeating every defender does not replace holding two posts. The exact condition is always shown in the objective panel.
⌖ Стрелки: клетка · Enter: подтвердить приказ · Ctrl+Enter: завершить ход · WASD: камера|⌖ Arrows: tile · Enter: confirm order · Ctrl+Enter: end turn · WASD: camera
Стрелки: прицел · WASD: камера · H: все высоты|Arrows: aim · WASD: camera · H: all heights
Выбрать кампанию|Choose a campaign
Другие кампании|Other campaigns
Провести защищённого бойца к выходу|Escort the protected fighter to an exit
Защитить объект и бойца до конца налёта|Defend the site and fighter until the raid ends
Вывести обоих бойцов через выход|Bring both fighters to an exit
Продолжить бой|Continue battle
Выберите кампанию|Choose your campaign
Одиночная игра|Single player
заданий|missions
Дозор раскрывает продажу зимнего запаса. Девять заданий, шесть бойцов и выбор между спасением людей и семян.|The patrol uncovers the sale of winter stores. Nine missions, six classes, and a choice between saving people and seeds.
Каждая история доступна сразу. Прогресс сохраняется отдельно.|Both stories are available immediately. Progress is saved separately.
Открыть кампанию →|Open campaign →
Колокола оттепели|Bells of the Thaw
Шесть дней до посева|Six days before sowing
Весенний паводок угрожает деревням. Проведите мастера к мельнице, удержите дамбу и решите, кто вправе распоряжаться водой.|Spring floods threaten the villages. Escort the craftsman to the mill, hold the dike, and decide who has the right to control the water.
Прогресс оттепели и диалоги будут сброшены. Первая кампания останется без изменений.|Thaw campaign progress and dialogue will reset. The first campaign will remain unchanged.
Вода снова идёт к полям. Все задания доступны для повторения.|Water is flowing to the fields again. All missions can be replayed.
Старые задания можно повторить. Прогресс обеих кампаний сохраняется отдельно.|Previous missions can be replayed. Both campaigns save their progress separately.
Глиняная дамба|Clay Dike
Оборона · первый паводок|Defense · the first flood
Удержите ворота дамбы четыре полных раунда и сохраните инженера Савву. Враг на воротах в конце красного хода означает поражение. Савве не обязательно стоять на воротах.|Hold the dike gate for four full rounds and keep the engineer Savva alive. An enemy at the gate at the end of Red's turn means defeat. Savva does not have to stand at the gate.
Щит защищает соседей. Копьё держит второй ряд. Инженер может поставить ловушку, но она опасна и для своих.|The shield protects adjacent allies. The spear holds the second rank. The engineer can place a trap, but it threatens allies too.
Савва, мастер дамбы|Savva, dike craftsman
Ремонтный дозор|Repair patrol
Сборщики воды|Water collectors
Мельничный рукав|Mill Channel
Сопровождение · два моста|Escort · two bridges
Проведите Савву к любому восточному выходу за 14 раундов. Его гибель означает поражение. Хрупкий верхний мост короток; нижний путь даёт обход.|Escort Savva to either eastern exit within 14 rounds. His death means defeat. The fragile upper bridge is shorter; the lower path offers a detour.
Мастер идёт вместе с отрядом. Выход отмечен стрелкой; достигнув его, Савва покинет бой. Не ломайте единственный доступный маршрут.|The craftsman moves with the squad. An arrow marks each exit; reaching it removes Savva from battle. Do not destroy the only available route.
Савва, мастер мельницы|Savva, mill craftsman
Мельничный дозор|Mill patrol
Охрана рукава|Channel guards
Три колокола|Three Bells
Контроль · три раздельных поста|Control · three separate posts
Удержите любые два из трёх сигнальных постов два полных круга подряд. Если останется менее двух, серия сбросится. Победа над защитниками сама по себе не завершает задание.|Hold any two of the three signal posts for two consecutive full rounds. Holding fewer than two resets your streak. Defeating the guards alone does not complete the mission.
Пять бойцов должны защитить три точки. Выдвигайте щит между постами, а быстрых бойцов направьте на дальние ступени.|Five fighters must protect three posts. Move the shield between the posts and send the faster fighters to the distant steps.
Сигнальный дозор|Signal patrol
Караул колоколов|Bell watch
Паромная ночь|Ferry Night
Эвакуация · двое на двух дорогах|Evacuation · two people on two roads
Выведите разведчика Мирона и мечника Олега к восточным выходам за 16 раундов. Оба должны выжить. После выхода боец больше не участвует в бою.|Bring the scout Miron and swordsman Oleg to the eastern exits within 16 rounds. Both must survive. After exiting, a fighter no longer participates in battle.
Один мост можно подорвать, поэтому не собирайте весь отряд на единственном переходе. Прикрытие держит путь до выхода обоих.|One bridge can be destroyed, so do not gather the whole squad on a single crossing. Keep the route covered until both fighters exit.
Олег, паромщик|Oleg, ferryman
Паромный дозор|Ferry patrol
Ночной заслон|Night blockade
Камень для воды|Stone for Water
Разгром · бой на двух уступах|Elimination · battle on two ledges
Победите всех бойцов, удерживающих каменоломню, за 16 раундов. Верхний уступ усиливает стрелков, но два лестничных подхода позволяют их обойти.|Defeat every fighter holding the quarry within 16 rounds. The upper ledge strengthens ranged fighters, but two stair approaches let you flank them.
Инженер разрушает укрытие. Копьё бьёт через союзника. Толчок с уступа наносит урон от падения: точный результат показан заранее.|The engineer destroys cover. The spear strikes through an ally. Pushing a target off a ledge deals fall damage: the exact result is previewed beforehand.
Каменный дозор|Stone patrol
Артель вооружённой стражи|Armed quarry guards
Верхний затвор|Upper Sluice
Финал · командир у плотины|Finale · commander at the dam
Победите командира верхней плотины до конца 16 раунда. Ваш щитоносец-командир должен выжить. Два моста ведут к разным лестницам.|Defeat the upper dam commander by the end of round 16. Your shieldbearer commander must survive. Two bridges lead to different stairs.
Золотой венец отмечает обоих командиров. Изолируйте вражеского щитоносца, не оставляя своего без прикрытия. Победа завершает вторую кампанию.|A golden crown marks both commanders. Isolate the enemy shieldbearer while keeping yours protected. Victory completes the second campaign.
Дозор оттепели|Thaw patrol
Стража верхней плотины|Upper dam guards
Журнал|Journal
полных раундов|full rounds
Сохраните отмеченных защитников.|Keep the marked defenders alive.
Провести мастера|Escort the craftsman
Защитить дамбу|Defend the dike
Победите командира ♛ за|Defeat the commander ♛ within
раундов. Защитите своего командира.|rounds. Protect your own commander.
Победите весь вражеский отряд за|Defeat the entire enemy squad within
Цель за|Deadline:
Если враг закончит ход на отмеченной клетке — поражение.|If an enemy ends their turn on the marked tile, you lose.
Касание: выбор и прогноз · один палец: панорама · два пальца: масштаб · приказ: кнопка подтверждения|Tap: select and preview · one finger: pan · two fingers: zoom · order: Confirm button
Сюжетная сцена|Story scene
Касание кнопок · Enter / пробел: далее · ←: назад · Esc: меню|Tap the buttons · Enter / Space: next · ←: back · Esc: menu
К сражению →|To battle →
К карте кампании →|To the campaign map →
Закрыть|Close
Выбор цели|Choose a target
Коснитесь доступной клетки или цели.|Tap an available tile or target.
Это решение прозвучит в итоговом разговоре.|This decision will be remembered in the final conversation.
Журнал реплик|Dialogue journal
Прочитанные реплики|Read dialogue
Звук|Audio
Пограничная долина|Border valley
До сражения|Before the battle
После сражения|After the battle
Отступление|Retreat
Пропустить сцену|Skip scene
Хроника|Chronicle
Решение Верена|Veren's decision
Тактическая хроника приграничья|A tactical chronicle of the borderlands
Займите перевалы, удержите сигнальные огни и разбейте вражеский строй. Каждый приказ виден до удара. Каждый уступ меняет бой.|Take the passes, hold the signal fires, and break the enemy formation. Preview every order before striking. Every ledge changes the battle.
Пепел и знамя|Ash and Banner
Пепел|Ash
и знамя|and Banner
Схватка с ИИ|Skirmish against AI
Локальный PvP|Local PvP
Обучение · 5 минут|Tutorial · 5 minutes
Кампания · Огни под пеплом|Campaign · Fires beneath the Ash
Настройки звука и доступности|Sound and accessibility settings
Как играть · справочник|How to play · field guide
Продолжить историю|Continue the story
Последний повтор|Latest replay
Завершено битв:|Battles completed:
побед Лазури:|Azure wins:
побед Ржавчины:|Rust wins:
Мышь: выбор и приказ · колесо: масштаб · перетаскивание: панорама · Enter: завершить ход · Esc: пауза|Mouse: select and order · wheel: zoom · drag: pan · Enter: end turn · Esc: pause
Перед битвой|Before the battle
сторона лазури|Azure side
сторона ржавчины|Rust side
схватка против ИИ|skirmish against AI
Соберите отряд|Build your squad
Отряд: 3–5 бойцов. Не более двух артефактов. Каждая специализация и реликвия меняет правила прямо на поле. Наведите курсор на бойца в матче, чтобы увидеть все его свойства.|Squad: 3–5 fighters. At most two artifacts. Every specialization and relic changes the rules on the field. Hover over a fighter during battle to see all their traits.
Резерв снабжения|Supply reserve
Специализация|Specialization
Без модификатора|No modifier
Без артефакта|No artifact
Модификатор|Modifier
Артефакт|Artifact
Добавить бойца|Add fighter
Выбрать отряд второй стороны|Choose the other side's squad
Выбрать второй отряд|Choose the second squad
Начать битву|Start battle
Сохранить состав|Save squad
Загрузить свой|Load saved squad
Готовые составы|Preset squads
Выберите пресет|Choose a preset
Состав:|Squad:
основной|basic
Название отряда|Squad name
Сложность ИИ|AI difficulty
Дозор · спокойный|Patrol · easy
Дружина · обычный|Warband · normal
Воевода · глубокий поиск|Warlord · hard
Цель матча|Match objective
Контроль сигнальных огней|Control the signal fires
Выбрала первая сторона|Chosen by the first side
Удерживайте две точки до 5 очков.|Hold two points to reach 5 points.
Выведите из боя вражеского командира.|Defeat the enemy commander.
Выведите из боя весь вражеский отряд.|Defeat the entire enemy squad.
Отменить шаг|Undo move
Завершить ход|End turn
Передышка|A moment's rest
Партия сохранена на этом устройстве.|The game is saved on this device.
Начать заново|Restart
Скорость анимаций|Animation speed
Высокий контраст|High contrast
Без анимации движения|Disable movement animations
Хроника перевала|Chronicle of the pass
Битва окончена|Battle ended
Новый бой|New battle
Боец на мосту погибнет.|The fighter on the bridge will die.
Остановлен: шаг и рывок запрещены до конца вашего хода.|Pinned: movement and dash are blocked until your turn ends.
Защищаемый боец|Protected fighter
выведен живым|evacuated alive
сохраните до конца обороны|keep alive until the defense ends
ведите к зелёному выходу|lead to a green exit
Порядок действий свободный|Act in any order
Выберите бойца|Select a fighter
Нажмите на своего бойца. Голубые клетки показывают возможное движение; наведите на врага для точного прогноза атаки.|Select one of your fighters. Blue tiles show available moves; hover over an enemy for an exact attack preview.
Полевые учения|Field training
Цель боя|Battle objective
Удержать сигнальные огни|Hold the signal fires
Победить всех бойцов|Defeat every fighter
Победить командира|Defeat the commander
победить командира|defeat the commander
Выведите из боя вражеского командира ♛. До конца 12-го раунда, если никто не достиг цели, решают выжившие и здоровье.|Defeat the enemy commander ♛. If neither side succeeds by the end of round 12, survivors and health decide the result.
Выведите из боя весь вражеский отряд. До конца 12-го раунда решают выжившие и здоровье.|Defeat the entire enemy squad. At the end of round 12, survivors and health decide the result.
Победите командира ♛ за 12 раундов. Защитите своего командира.|Defeat the commander ♛ within 12 rounds. Protect your own commander.
Победите весь вражеский отряд за 12 раундов.|Defeat the entire enemy squad within 12 rounds.
Цель за 12 раундов.|Complete the objective within 12 rounds.
Наведите на доступную клетку или цель.|Hover over an available tile or target.
Приказ недоступен|Order unavailable
Нет допустимого действия|No valid action
Цель погибнет.|The target will die.
Под ударом врага на следующем ходу.|Exposed to an enemy attack next turn.
Точный прогноз до подтверждения|Exact preview before confirmation
Боец покинет поле живым. Отменить выход нельзя.|The fighter will leave the field alive. Leaving cannot be undone.
Задача будет выполнена.|The objective will be completed.
После удара:|After the strike:
хранилище: не допустить врага к концу его хода|granary: keep enemies out at the end of their turn
неактивный сигнальный пост|inactive signal post
сигнальный огонь|signal fire
хрупкий мост|fragile bridge
позиция сверху +1|higher ground +1
выстрел снизу −1|shooting uphill −1
стража цели −1|target's guard −1
щит союзника −1|ally's shield −1
Расчёт:|Calculation:
Займите позицию|Take a position
Рассчитайте удар|Preview the strike
Передайте ход|End your turn
Учения продолжаются|Training continues
Нажмите на своего бойца.|Select one of your fighters.
Нажмите на одного из трёх бойцов Лазури. Порядок их действий выбираете вы.|Select one of the three Azure fighters. You choose their order of action.
Голубые клетки показывают доступный маршрут. Подъём стоит дополнительное движение; лестница позволяет подняться выше.|Blue tiles show available routes. Climbing costs extra movement; stairs allow a higher climb.
Выберите другого бойца или наведите на врага. Панель прогноза покажет урон, отбрасывание и блокировку обзора до клика.|Select another fighter or hover over an enemy. The preview shows damage, knockback, and blocked sight before you click.
Неиспользованный боец ещё может действовать. Когда закончите, нажмите «Завершить ход»; затем ответит враг. Цель — командир Ржавчины ♛.|A fighter who has not acted can still take an action. When finished, press “End turn”; the enemy will respond. Your target is the Rust commander ♛.
Используйте высоту, берегите лучника в ближнем бою и бейте копьём по прямой через союзника. Победите командира Ржавчины ♛.|Use higher ground, keep the archer out of melee, and strike with a spear in a straight line through an ally. Defeat the Rust commander ♛.
Сенсорное управление|Touch controls
Касание — выбор и прогноз · проведите пальцем — камера · два пальца — масштаб|Tap: select and preview · drag: camera · two fingers: zoom
Подтвердить приказ|Confirm order
Подтвердить шаг|Confirm move
Подтвердить приём|Confirm ability
Подтвердить атаку|Confirm attack
Снять выбор|Clear selection
Удар по мосту|Strike bridge
Капкан / подрыв|Trap / demolition
Толчок / стража|Push / guard
Прицельный выстрел|Aimed shot
Укрепление|Reinforce
Проверьте прогноз и подтвердите приказ кнопкой.|Check the preview, then press the button to confirm the order.
Клетки: касание выбирает землю за фигурой.|Tiles: tap to select the ground behind a figure.
Удар по мосту: выберите бойца, коснитесь моста и проверьте прогноз.|Strike bridge: select a fighter, tap the bridge, and check the preview.
ЛКМ: выбор и приказ · ПКМ: отмена выбора · колесо: масштаб · перетаскивание: карта · Enter: завершить ход|Left click: select and order · right click: clear selection · wheel: zoom · drag: map · Enter: end turn
ЛКМ: приказ · ПКМ: отмена выбора · колесо: масштаб · перетаскивание: карта|Left click: order · right click: clear selection · wheel: zoom · drag: map
Shift+ЛКМ: сломать мост|Shift+left click: break bridge
урона при остановке|damage when stopping
Выход: отмеченные бойцы покидают поле живыми|Exit: marked fighters leave the field alive
все высоты|all heights
ПОРАЖЁН|DEFEATED
Чистая линия обзора. С высоты +1 урон.|Clear line of sight required. Higher ground gives +1 damage.
Прицельный выстрел: +1 урон, затем стрелок не может двигаться.|Aimed shot: +1 damage; the archer cannot move afterward.
Сильный ближний бой, держит проход.|Strong in melee; holds a passage.
Приём по врагу — толчок на клетку, 2 урона. Приём по себе — стража: −1 входящий урон, ответ 1 на соседний удар, если выжил. Вместо атаки, до начала следующего своего хода.|Use the ability on an enemy to push them one tile and deal 2 damage. Use it on yourself to guard: −1 incoming damage and a 1 damage counterattack against an adjacent strike if you survive. Replaces an attack; lasts until your next turn starts.
Удар по прямой через союзника.|Strikes in a straight line through an ally.
Натиск: удар и толчок на клетку от копейщика. После успешного толчка цель не может двигаться или делать рывок до конца своего следующего хода, но может атаковать. Тяжёлая или заблокированная цель не останавливается.|Thrust: strike and push one tile away from the spearman. A successful push prevents movement and dash until the target's next turn ends, but they can still attack. Heavy or blocked targets are not pinned.
Соседние союзники получают -1 урон.|Adjacent allies take -1 damage.
Стража: до следующего хода щитоносец получает на 1 урон меньше.|Guard: the shieldbearer takes 1 less damage until their next turn.
Быстрый обход. +1 урон по врагу рядом с союзником.|Fast flanking. +1 damage against an enemy beside an ally.
Рывок вместо атаки: на свободную клетку в двух шагах, затем движение использовано.|Dash replaces an attack: move to a free tile two steps away, spending movement too.
Ставит ловушки, ломает укрытия и мосты.|Places traps and destroys cover and bridges.
Ловушка на соседней пустой клетке или подрыв соседнего хрупкого моста.|Place a trap on an empty adjacent tile or demolish an adjacent fragile bridge.
Дальнострел|Longbow
Охотник|Hunter
Хранитель|Warden
Дуэлянт|Duelist
Пикинёр|Pikeman
Налётчик|Raider
Башня|Tower
Конвоир|Escort
Бегун|Runner
Засадник|Ambusher
Сапёр|Sapper
Каменщик|Mason
+1 дальность, -1 движение|+1 range, -1 movement
+1 движение, дальность -1|+1 movement, -1 range
+1 здоровье, движение -1|+1 health, -1 movement
+1 урон по одинокой цели, -1 здоровье|+1 damage against an isolated target, -1 health
Дальность 3 по прямой, движение -1|Range 3 in a straight line, -1 movement
+1 движение, -1 здоровье|+1 movement, -1 health
+2 здоровье, движение -1|+2 health, -1 movement
+1 движение, защита соседей только в страже|+1 movement; protects neighbors only while guarding
+1 урон по цели на опасной клетке|+1 damage against a target on a hazardous tile
Ловушки наносят +1 урон|Traps deal +1 damage
Укрепляет укрытие и мост|Reinforces cover and bridges
Не отбрасывается, -1 движение|Cannot be pushed, -1 movement
+1 здоровье, +2 стоимость|+1 health, +2 cost
Тяжёлый|Heavy
Стремительный|Swift
Ветеран|Veteran
Крюк ущелья|Gorge Hook
Сапоги склона|Slope Boots
Угольный знак|Ember Mark
Полевой стяг|Field Standard
Толчок отбрасывает ещё на клетку, если она свободна|Pushes one extra tile if it is free
Подъём на один уровень не требует доплаты|Climbing one level costs no extra movement
+1 урон по цели у костра или в ловушке|+1 damage against a target at a brazier or in a trap
Союзники рядом наносят +1 урон|Adjacent allies deal +1 damage
Каменный дозор|Stone Patrol
Стражи перевала|Pass Wardens
Быстрый удар|Swift Strike
В отряде не более двух артефактов|A squad may have at most two artifacts
Неизвестный класс:|Unknown class:
Неизвестная специализация:|Unknown specialization:
Неизвестный модификатор:|Unknown modifier:
Неизвестный артефакт:|Unknown artifact:
Тяжёлое снаряжение несовместимо с разведчиком|Heavy equipment is incompatible with a scout
Щитоносец не может взять стремительный модификатор|A shieldbearer cannot take the Swift modifier
Крюк доступен только мечнику и копейщику|The hook is available only to swordsmen and spearmen
Разведчик не несёт стяг|A scout cannot carry the standard
Неизвестная миссия кампании|Unknown campaign mission
Битва начинается|The battle begins
Вне поля|Outside the field
Обзор закрыт бойцом|Line of sight blocked by fighter
Обзор закрыт:|Line of sight blocked:
Лучник не стреляет вплотную|Archers cannot shoot adjacent targets
Цель вне дальности|Target out of range
Копьё бьёт только по прямой|Spears strike only in a straight line
Линия копья перекрыта|Spear line blocked
Нет линии броска|No clear throwing line
Нужна соседняя клетка|An adjacent tile is required
Слишком большой перепад высот|Height difference too large
Нет разрушаемого объекта|No destructible object
Мост рушится: вода; боец на мосту погибает|The bridge collapses into water; a fighter on it dies
Укрытие разрушено: проход открыт|Cover destroyed: passage open
прочности после удара|durability after the strike
Матч завершён|Match finished
Боец недоступен|Fighter unavailable
Ход другой стороны|It is the other side's turn
Перемещение уже нельзя отменить|This move can no longer be undone
Исходная клетка занята|The original tile is occupied
Исходная клетка больше недоступна|The original tile is no longer accessible
Боец остановлен натиском: шаг недоступен до конца хода|Pinned by a thrust: cannot move until the turn ends
После прицельного выстрела движение недоступно|Cannot move after an aimed shot
Движение уже потрачено|Movement already spent
Клетка недоступна: дальность, высота или препятствие|Tile unavailable: range, height, or obstacle
очк. движения|movement points
Действие уже потрачено|Action already spent
Стража мечника: −1 входящий урон и ответ 1 на соседний удар, если мечник выживет. До начала следующего своего хода; расходует атаку.|Swordsman's guard: −1 incoming damage and a 1 damage counterattack against an adjacent strike if the swordsman survives. Lasts until their next turn starts; spends the attack.
Стража применяется к себе|Guard must target yourself
Стража: -1 входящий урон щитоносцу до следующего хода; прикрытие соседей сохраняется|Guard: the shieldbearer takes -1 damage until their next turn; protection of neighbors remains
Укрепление только на соседней клетке|Only adjacent tiles can be reinforced
Объект уже укреплён до предела: 4 прочности|Object already reinforced to the limit: 4 durability
Объект укреплён:|Object reinforced:
Подрыв моста только с соседней клетки|A bridge can only be demolished from an adjacent tile
Ловушка ставится на свободную соседнюю клетку|Place traps on a free adjacent tile
урона вступившему бойцу|damage to a fighter who enters
Боец остановлен натиском: рывок недоступен|Pinned by a thrust: dash unavailable
Рывок на свободную клетку в двух шагах|Dash to a free tile two steps away
Перепад высот слишком велик|Height difference too large
Рывок через занятую клетку|Dash across an occupied tile
Нужен вражеский боец|An enemy fighter is required
остановка движения до конца следующего хода цели|movement pinned until the target's next turn ends
контратака 1|counterattack 1
вышел к безопасному выходу|reached a safe exit
Результат задания:|Mission result:
Обе дружины погибли|Both warbands were defeated
Синий дозор|Blue Patrol
Красная дружина|Red Warband
Оба командира погибли|Both commanders were defeated
Победа над командиром:|Commander victory:
Победа по контролю:|Control victory:
Недопустимое действие|Invalid action
переместился|moved
и получил|and took
встал в стражу|took a guard stance
поставил ловушку|placed a trap
совершил рывок|dashed
укрепил объект|reinforced the object
повредил объект на|damaged the object for
ударил|struck
цель погибла|target died
отменил перемещение|undid movement
удерживает|holds
Враг удержал ворота амбара|The enemy held the granary gates
Задание провалено: цель не выполнена за 12 раундов|Mission failed: objective not completed within 12 rounds
Ничья по лимиту раундов|Draw at the round limit
Победа по очкам:|Victory on points:
Победа по числу бойцов и здоровью:|Victory by survivors and health:
Повреждённое сохранение|Corrupted save
Обрушение моста|Bridge collapse
Опасная клетка|Hazardous tile
Контратака|Counterattack
Провести обоз|Escort the caravan
Вывести людей|Evacuate the people
Защитить хранилище|Defend the granary
Условия победы и поражения|Victory and defeat conditions
Задача кампании|Campaign objective
Разгром врага не заменяет задачу. Завершите её до конца|Defeating the enemy does not replace the objective. Complete it before the end of
Доведите отмеченных бойцов до зелёных выходов|Lead the marked fighters to the green exits
Гибель любого сопровождаемого — поражение.|Losing any escorted fighter means defeat.
Выведите|Evacuate
отмеченных бойцов через зелёные выходы|marked fighters through the green exits
Вышедшие покидают поле живыми. Если спасти нужное число уже нельзя — поражение.|Evacuated fighters leave the field alive. If too few can still be saved, you lose.
Защитите|Defend
в течение|for
полных раундов. Если враг закончит ход на клетке хранилища — поражение. Сохраните отмеченных защитников.|full rounds. If an enemy ends their turn on the granary tile, you lose. Keep the marked defenders alive.
Потерян|Lost
Вышел|Exited
выведен|evacuated
вышли|exited
Боец|Fighter
После последней печи · решение Веры|After the last kiln · Vera's decision
Выбор пути|Choose a route
Кого защитит дозор?|Who will the patrol protect?
Обоз и зимнее хранилище под ударом одновременно. На оба места дозора не хватит. Решение сохранится до новой кампании.|The caravan and winter granary are under attack at the same time. The patrol cannot cover both. Your decision lasts until a new campaign.
Защитить беженцев|Protect the refugees
Тиса проведёт обоз через засады; Рада останется с жителями. Семенной склад останется без щитов: зимой придётся делить малый запас и просить соседей о помощи.|Tisa will lead the caravan through ambushes; Rada will stay with the villagers. The seed store will lack protection: winter will bring rationing and requests for help from neighbors.
Вести людей · путь каравана|Lead the people · caravan route
Защитить семена|Protect the seeds
Савва и Бор удержат хранилище для весеннего посева. Обоз пойдёт с проводниками без дозора: на перевале придётся искать отставших и отвечать за потери.|Savva and Bor will hold the granary for spring planting. The caravan will travel with guides but without the patrol: at the pass you will search for stragglers and answer for the losses.
Беречь весну · путь хранилища|Preserve spring · granary route
Начать дорогу заново?|Start the journey again?
Пройденные задания, сюжетные решения и позиция диалога будут сброшены. Путь каравана или хранилища можно будет выбрать заново после последней печи.|Completed missions, story decisions, and dialogue position will be reset. You can choose the caravan or granary route again after the last kiln.
Начать новую кампанию|Start a new campaign
Вернуться к кампании|Return to campaign
Новая кампания|New campaign
Огни под пеплом|Fires beneath the Ash
заданий пути|route missions
Дорога через зиму|The Road through Winter
Совет услышал дозор. Развязка зависит от вашего пути; пройденные сражения доступны для повторения.|The council has heard the patrol. The ending depends on your route; completed battles can be replayed.
Шесть встреч открывают развилку: защитить обоз или семенной запас. Затем дозор пройдёт перевал и ответит перед советом.|Six encounters lead to a choice: protect the caravan or the seed supply. The patrol will then cross the pass and answer to the council.
Ваш путь:|Your route:
защита беженцев|protecting the refugees
защита семян|protecting the seeds
Решение сохраняется при повторении сцен.|The decision is retained when replaying scenes.
Задания кампании|Campaign missions
Другой путь|Other route
Закрыто|Locked
Старые задания можно повторить. Альтернативный путь открывается в новой кампании.|Past missions can be replayed. The alternative route is available in a new campaign.
Пройдено · можно повторить|Completed · replay available
Следующее задание|Next mission
Задание закрыто|Mission locked
Новый боец|New fighter
Тактика дозора|Patrol tactics
Ваш дозор|Your patrol
Цель и срок указаны в задании.|The mission specifies its objective and deadline.
Подсказки помогают изучать приёмы; они не обязательны для победы.|Hints help you practice abilities; they are optional for victory.
Повторить задание|Replay mission
Начать задание|Start mission
Освоение:|Practice:
Приёмы опробованы. Завершите боевую задачу.|Abilities practiced. Complete the battle objective.
Все подсказки|All hints
Цель обязательна; подсказки — для практики. Раунд|The objective is required; hints are for practice. Round
Кампания завершена. Разговор после боя содержит развязку вашего пути.|Campaign completed. The conversation after battle contains your route's ending.
После разговора у печей выберите: провести беженцев или защитить зимние семена.|After the conversation at the kilns, choose to escort the refugees or protect the winter seeds.
Вернитесь к карте кампании, чтобы продолжить выбранный путь.|Return to the campaign map to continue your chosen route.
Дозор вернулся|The patrol has returned
Задание выполнено|Mission completed
Задание не выполнено|Mission failed
Попробуйте другой порядок действий и проверьте угрозы перед завершением хода.|Try a different order of actions and check threats before ending your turn.
Разговор после боя|Conversation after battle
Отступление|Retreat
Карта кампании|Campaign map
Диалог перед боем|Dialogue before battle
После боя|After battle
Провести возницу к выходу|Escort the driver to the exit
Сохранить хранилище до конца налёта|Keep the granary safe until the raid ends
Вывести обоих свидетелей через выход|Evacuate both witnesses through an exit
Победить весь отряд|Defeat the entire squad
Вернуться в главное меню|Return to main menu
Главное меню|Main menu
В меню|To menu
Меню|Menu
Продолжить|Continue
Убрать|Remove
Назад|Back
Далее|Next
Настройки|Settings
Звуки|Sound
Музыка|Music
Спокойно|Slow
Обычно|Normal
Быстро|Fast
Готово|Done
Пауза|Pause
Победа|Victory
Здоровье|Health
Движение|Movement
Атака|Attack
Высота|Height
Высоты|Heights
Приём|Ability
Приказы|Orders
Отряды|Squads
Отряд|Squad
Наведение|Hover
Маршрут|Route
Стоимость|Cost
Ответ|Counter
Отбрасывание|Knockback
Падение|Fall
Опасность|Hazard
Хроника|Chronicle
Объект|Object
Цель|Objective
Стража|Guard
Натиск|Thrust
Рывок|Dash
Клетки|Tiles
Ловушка|Trap
Костёр|Brazier
Мост|Bridge
Укрытие|Cover
Урон|Damage
Бюджет|Budget
Лазури|Azure
Лазурь|Azure
Ржавчины|Rust
Ржавчина|Rust
Лучник|Archer
Мечник|Swordsman
Копейщик|Spearman
Щитоносец|Shieldbearer
Разведчик|Scout
Инженер|Engineer
движение|movement
здоровье|health
дальность|range
прочности|durability
прочность|durability
отбрасывание|knockback
падение|fall
опасность|hazard
контратака|counterattack
толчок|push
ловушка|trap
костёр|brazier
укрытие|cover
лестница|stairs
обломки|rubble
трава|grass
камень|stone
вода|water
мост|bridge
высота|height
урона|damage
урон|damage
ответ|counter
исп.|used
шаг|move
к бюджету|budget cost
превышен|exceeded
бойцов|fighters
точки|points
точек|points
раундов|rounds
раунда|round
раунд|round
Раунд|Round
Ходов:|Turns:
Ход|Turn
очк.|points
очков|points
максимум|maximum
Кампания|Campaign
карт|maps
Задание:|Mission:
от|from
до|to
Ничья после|Draw after
Победила сторона|Winning side:
Удерживайте две из четырёх точек в конце полного раунда. Серия до|Hold two of the four points at the end of a full round. A streak of
очков сбрасывается при потере контроля.|points resets when control is lost.
Удерживайте|Hold
из|of
точек в конце полного раунда. Серия до|points at the end of a full round. A streak of
очков сбрасывается, если контроль потерян.|points resets if control is lost.
го раунда.|round.
го|th
Зольный брод|Ash Ford
Сторожевая терраса|Watch Terrace
Копейные ступени|Spear Steps
Ворота дозора|Patrol Gates
Тропа в тростниках|Reed Trail
Последняя печь|The Last Kiln
Караванное ущелье|Caravan Gorge
Ночной амбар|Night Granary
Последние лодки|The Last Boats
Вершина Серой Короны|Gray Crown Summit
Перевал Серой Короны|Gray Crown Pass
Ступени пепла|Steps of Ash
Живые на дороге|The Living on the Road
Цена весны|The Price of Spring
Последний переход|The Last Crossing
Право на огонь|The Right to Fire
Мира, проводник|Mira, guide
Мирон, проводник|Miron, guide
Савва, хранитель амбара|Savva, granary keeper
Олег, свидетель|Oleg, witness
Мира, свидетель|Mira, witness
Мирон, свидетель|Miron, witness
Неизвестная карта:|Unknown map:
Учебный дозор|Training Patrol
Учебный враг|Training Enemy
Первый дозор|First Patrol
Разбойник брода|Ford Bandit
Стрелковый дозор|Archer Patrol
Сторожевая шайка|Watch Gang
Строй дозора|Patrol Formation
Стража лестницы|Stair Guard
Стражи ворот|Gate Wardens
Вражеский дозор|Enemy Patrol
Тростниковый дозор|Reed Patrol
Охрана командира|Commander's Guard
Дозор печи|Kiln Patrol
Защитники печи|Kiln Defenders
Охрана каравана|Caravan Guard
Засада ущелья|Gorge Ambush
Стража амбара|Granary Guard
Ночные налётчики|Night Raiders
Отходящий дозор|Retreating Patrol
Преследователи|Pursuers
Дозор Серой Короны|Gray Crown Patrol
Стража наместника|Governor's Guard
Пепел и Знамя|Ash and Banner
После последней печи · решение Верена|After the last kiln · Veren's decision
Тихон проведёт обоз через засады; Радомир останется с жителями. Семенной склад останется без щитов: зимой придётся делить малый запас и просить соседей о помощи.|Tikhon will lead the caravan through ambushes; Radomir will stay with the villagers. The seed store will lack protection: winter will bring rationing and requests for help from neighbors.
Решение Верена|Veren's decision
Мечник · соседняя клетка и толчок|Swordsman · adjacent tiles and pushing
Лучник · обзор и высота|Archer · sight and height
Копейщик · удар через союзника|Spearman · strikes through allies
Щитоносец · прикрытие и удержание|Shieldbearer · protection and holding ground
Разведчик · обход и выход из боя|Scout · flanking and withdrawal
Инженер · ловушки и хрупкие мосты|Engineer · traps and fragile bridges
Сопровождение · вывести проводника|Escort · get the guide out
Оборона · четыре полных раунда|Defense · four full rounds
Эвакуация · вывести двух свидетелей|Evacuation · get two witnesses out
Финал · командир на высоте|Finale · commander on higher ground
Дозор потерял связь с деревней за рекой. Сбейте главаря с брода: его падение завершит бой. Золотой венец отмечает командира.|The patrol has lost contact with the village across the river. Defeat the leader at the ford to end the battle. A golden crown marks the commander.
Мечник двигается на 4 клетки и бьёт рядом на 3 урона. Толчок наносит 2 урона и сдвигает цель. Если за целью вода или препятствие, столкновение наносит ещё 1 урон.|A swordsman moves 4 tiles and deals 3 damage to adjacent targets. Push deals 2 damage and shifts the target. Water or an obstacle behind the target causes a collision for 1 extra damage.
Подойдите к броду. Перемещение можно отменить до удара.|Approach the ford. Movement can be undone before striking.
Ударьте соседнего врага — результат показан до клика.|Strike an adjacent enemy: the result is shown before you click.
Попробуйте толчок; проверьте конечную клетку цели.|Try a push; check the target's destination tile.
Враг занял каменную террасу. Очистите её двумя бойцами. Лучник уже стоит наверху, мечник прикрывает нижний подход.|The enemy holds the stone terrace. Clear it with two fighters. The archer starts above; the swordsman covers the lower approach.
Лучник стреляет на 2–6 клеток по чистой линии. Высота даёт +1 урон; нельзя стрелять по соседнему врагу. Укрытие и бойцы закрывают обзор.|An archer shoots 2–6 tiles along a clear line. Higher ground gives +1 damage; adjacent enemies cannot be shot. Cover and fighters block sight.
Переместите мечника к нижнему подходу.|Move the swordsman to the lower approach.
Выстрелите с террасы: проверьте бонус высоты.|Shoot from the terrace: check the height bonus.
Прицельный выстрел добавляет 1 урон и запрещает движение.|Aimed shot adds 1 damage and prevents movement.
Главарь укрылся за своими людьми у лестницы. Мечник держит проход, копейщик атакует из второго ряда, лучник ловит обходящих.|The leader hides behind his men at the stairs. The swordsman holds the passage, the spearman attacks from the second row, and the archer catches flankers.
Копьё бьёт на 1–2 клетки только по прямой и проходит через союзника. Натиск отбрасывает и останавливает цель. Расставьте строй перед ударом.|Spears strike 1–2 tiles in a straight line through allies. Thrust pushes and pins the target. Arrange your formation before striking.
Передвиньте мечника в проход.|Move the swordsman into the passage.
Ударьте копьём по прямой через своего бойца.|Strike with the spear in a straight line through your fighter.
Натиск остановит движение цели и столкнёт её со ступени.|Thrust pins the target and pushes them off the step.
Захватите оба знамени у ворот на два полных круга подряд. При потере контроля серия сбрасывается. Щитоносец прикрывает соседей, пока они занимают точки.|Hold both banners at the gates for two consecutive full rounds. Losing control resets the streak. The shieldbearer protects neighbors while they occupy the points.
Соседство со щитоносцем снижает входящий урон союзнику на 1. Стража дополнительно защищает самого щитоносца до следующего хода. Он медленный — выдвиньте его первым.|An adjacent shieldbearer reduces an ally's incoming damage by 1. Guard also protects the shieldbearer until their next turn. They are slow: move them first.
Подведите щитоносца к союзнику на точке.|Move the shieldbearer beside an ally on a point.
Включите стражу перед ответным ходом.|Activate guard before the enemy turn.
Прикрываемый союзник атакует из защищённой позиции.|The protected ally attacks from a defended position.
Командир ведёт стрелков по верхнему мосту. Обойдите его через нижний брод или пробейтесь прямо. Ловушка на нижней тропе наносит урон, если закончить на ней движение. Завершите шаг за ней или перепрыгните её рывком.|The commander leads archers over the upper bridge. Flank through the lower ford or fight through directly. The trap on the lower trail deals damage if movement ends on it. Stop beyond it or dash across.
Разведчик проходит 5 клеток, но имеет только 4 здоровья. Он получает +1 урон во фланг цели рядом с союзником. Вместо удара он может сделать рывок на свободную клетку в двух шагах, перепрыгнув занятую клетку.|A scout moves 5 tiles but has only 4 health. They gain +1 damage when flanking a target beside an ally. Instead of striking, they can dash to a free tile two steps away, jumping over an occupied tile.
Обойдите строй по нижней тропе. Не заканчивайте движение на ловушке.|Flank along the lower trail. Do not end movement on a trap.
Атакуйте цель, которую уже связывает союзник.|Attack a target already engaged by an ally.
В другом ходу используйте рывок на свободную клетку в двух шагах.|On another turn, dash to a free tile two steps away.
Последний отряд заперся у старых печей. Победите всех защитников. Инженер может расчистить укрытие ударом или подорвать соседний мост вместе с врагом.|The last squad is trapped at the old kilns. Defeat all defenders. The engineer can clear cover with an attack or demolish an adjacent bridge with an enemy on it.
Инженер стреляет на 3 клетки, но наносит мало урона. Его сила — окружение: ломайте укрытия, ставьте ловушки на пустой соседней клетке и подрывайте хрупкие мосты. Два моста дают разные маршруты.|The engineer shoots 3 tiles but deals little damage. Their strength is the environment: break cover, place traps on empty adjacent tiles, and demolish fragile bridges. Two bridges offer different routes.
Подведите инженера к хрупкому мосту.|Move the engineer beside a fragile bridge.
Ударьте по врагу или разрушаемому укрытию.|Strike an enemy or destructible cover.
Поставьте ловушку или подорвите соседний мост.|Place a trap or demolish an adjacent bridge.
Доведите разведчицу Миру до восточного выхода за 12 раундов. Её гибель означает поражение. Спасая беженцев, дозор теряет часть семенного запаса.|Lead the scout Mira to an eastern exit within 12 rounds. Her death means defeat. Saving the refugees costs the patrol some of its seed supply.
Мира — обычная разведчица под вашим управлением. Прикройте её щитом или расчистите южный брод. Уничтожение врагов не заменяет выход.|Mira is a regular scout under your control. Protect her with a shield or clear the southern ford. Defeating the enemies does not replace reaching the exit.
Доведите разведчика Мирона до восточного выхода за 12 раундов. Его гибель означает поражение. Спасая беженцев, дозор теряет часть семенного запаса.|Lead the scout Miron to an eastern exit within 12 rounds. His death means defeat. Saving the refugees costs the patrol some of its seed supply.
Мирон — обычный разведчик под вашим управлением. Прикройте его щитом или расчистите южный брод. Уничтожение врагов не заменяет выход.|Miron is a regular scout under your control. Protect him with a shield or clear the southern ford. Defeating the enemies does not replace reaching the exit.
Мирон — разведчик под вашим управлением. Прикройте его щитом или расчистите южный брод. Уничтожение врагов не заменяет выход.|Miron is a scout under your control. Protect him with a shield or clear the southern ford. Defeating the enemies does not replace reaching the exit.
Сохраните инженера Савву и ворота амбара четыре полных раунда. Гибель Саввы или враг на воротах в конце красного хода означают поражение. Двое возниц остаются в тылу.|Keep the engineer Savva and the granary gates safe for four full rounds. Savva's death or an enemy on the gates at the end of a red turn means defeat. Two drivers remain behind the lines.
Савва — обычный инженер. Перекройте два подхода щитом и копьём. Даже после гибели всех налётчиков нужно дождаться конца четвёртого раунда.|Savva is a regular engineer. Block the two approaches with shield and spear. Even after all raiders die, you must wait until the fourth round ends.
Выведите мечника Олега и разведчика Миру к восточным выходам за 12 раундов. Оба должны выжить. Остальные трое прикрывают переход.|Get the swordsman Oleg and scout Mira to the eastern exits within 12 rounds. Both must survive. The other three cover the crossing.
Выведите мечника Олега и разведчика Мирона к восточным выходам за 12 раундов. Оба должны выжить. Остальные трое прикрывают переход.|Get the swordsman Oleg and scout Miron to the eastern exits within 12 rounds. Both must survive. The other three cover the crossing.
На выходе боец покидает поле и больше не атакует. Используйте два маршрута. Победа над преследователями не заменяет спасение обоих свидетелей.|A fighter at an exit leaves the field and can no longer attack. Use both routes. Defeating the pursuers does not replace saving both witnesses.
Победите командира наместника до конца 12 раунда. Ваш командир должен выжить, чтобы дозор добрался до народного совета.|Defeat the governor's commander before round 12 ends. Your commander must survive so the patrol can reach the people's council.
Высота усиливает стрелка, щит защищает строй, копьё достаёт через союзника. Инженер открывает проход, разведчик обходит защитников.|Higher ground strengthens an archer, shields protect the formation, and spears reach through allies. The engineer opens a passage; the scout flanks the defenders.
Полевой справочник|Field guide
Как играть|How to play
Читайте поле, проверяйте прогноз, выбирайте порядок приказов.|Read the field, check the preview, choose the order of your commands.
Разделы справочника|Guide sections
Цвета клеток|Tile colors
Контратаки|Counterattacks
Бойцы|Fighters
Снаряжение|Equipment
Цели и управление|Objectives and controls
Первое, что нужно знать|The first thing to know
Что означают цвета клеток|What tile colors mean
Голубая — доступный шаг|Blue: available move
Выбранный боец может закончить перемещение здесь. Наведение показывает маршрут и стоимость. Это не обещание безопасности: враг может переместиться и атаковать с другой позиции.|The selected fighter can end movement here. Hovering shows the route and cost. This does not guarantee safety: an enemy can move and attack from another position.
Красная — цель вашей атаки|Red: a target for your attack
На клетке стоит враг, которого можно ударить выбранной атакой или приёмом. Красный крест на клетке под курсором означает другое: приказ запрещён. Причина написана в прогнозе.|An enemy on this tile can be hit with the selected attack or ability. A red cross under the cursor means the order is invalid. The preview explains why.
Оранжевая — доступно, но под угрозой|Orange: available but threatened
Сюда можно пройти, но враг|You can move here, but an enemy
со своей текущей позиции|from their current position
сможет атаковать бойца на следующем ходу. Сам цвет не наносит урон. Проверка учитывает дальность и обзор; будущие перемещения и комбинации врага она не рассчитывает.|can attack the fighter next turn. The color itself deals no damage. The check accounts for range and sight; it does not predict enemy movement or combinations.
Янтарный контур и −число — опасность земли|Amber outline and −number: terrain hazard
Капкан наносит 2 урона, капкан Сапёра — 3, огонь — 1. Урон срабатывает при|A trap deals 2 damage, a Sapper's trap 3, and fire 1. Damage triggers when
остановке|stopping
на клетке: шаге, рывке или отбрасывании. Проход через промежуточную опасную клетку безопасен. Капкан одноразовый.|on the tile after movement, dash, or knockback. Passing through an intermediate hazardous tile is safe. Traps trigger only once.
Опасная клетка тоже подсвечивается оранжевым. Отличайте её по предмету и маркеру −1/−2/−3; в прогнозе будет «Опасность».|Hazardous tiles are also highlighted orange. Identify them by the object and −1/−2/−3 marker; the preview will say “Hazard”.
Оранжевая ≠ немедленный урон.|Orange ≠ immediate damage.
Например, пустая оранжевая клетка у вражеского лучника — предупреждение о выстреле. Оранжевая клетка с капканом −2 — потеря 2 HP сразу при прибытии. Совпадение обеих угроз возможно.|For example, an empty orange tile near an enemy archer warns of a shot. An orange tile with a −2 trap costs 2 HP immediately on arrival. Both threats may occur together.
Светлый пунктир — ваш маршрут; красный пунктир между бойцами — доступная атака врага с текущего места, а не гарантированный приказ ИИ. Золотое свечение и номер — точка контроля. Голубое основание/полоса здоровья — Лазурь, коралловое — Ржавчина. ♛ отмечает командира; ✦ — артефакт; ✓ в списке — атака уже использована.|Light dotted lines show your route; red dotted lines between fighters show an enemy attack available from their current position, without predicting the AI's order. A golden glow and number mark a control point. Blue bases and health bars mean Azure; coral means Rust. ♛ marks a commander; ✦ an artifact; ✓ in the list means the attack has been used.
Один ход: шаг и действие|One turn: movement and an action
Порядок выбираете вы|You choose the order
Каждый боец получает одно перемещение и одну атаку|Each fighter gets one move and one attack
или|or
приём. Переключайтесь между бойцами в любом порядке. Можно сначала атаковать, потом двигаться. Исключения: прицельный выстрел расходует возможность движения, а рывок занимает и движение, и действие.|ability. Switch between fighters in any order. You can attack before moving. Exceptions: aimed shot spends movement, and dash spends both movement and the action.
Сначала прогноз, потом клик|Preview first, then click
Наведите курсор: «Урон» — прямой удар, «Ответ» — урон вашему атакующему, «Падение» и «Опасность» — последствия для цели. Прогноз также показывает сдвиг, смерть и изменение объекта. Число над бойцом после действия — фактически потерянное здоровье и источник.|Hover to preview: “Damage” is the direct strike, “Counter” is damage to your attacker, and “Fall” and “Hazard” are consequences for the target. The preview also shows displacement, death, and object changes. Numbers above a fighter after an action show actual health lost and its source.
Шаг можно отменить кнопкой или U, пока этот боец не атаковал/не применил приём, не получил урон и исходная клетка свободна и проходима. После завершения матча отмена недоступна. «Завершить ход» передаёт очередь противнику; на ходе ИИ ваши приказы заблокированы.|Undo a move with the button or U if the fighter has not attacked, used an ability, or taken damage, and the original tile is free and passable. Undo is unavailable after the match ends. “End turn” hands play to the opponent; your orders are blocked during the AI turn.
Где показана высота|Where to see height
Светлая цифра на тёмном жетоне — уровень клетки|A light number on a dark token shows the tile level
Чем выше уступ и его боковая грань, тем выше клетка. Число появляется возле бойцов, лестниц, доступных шагов и наведения. Удерживайте|A taller ledge and side face mean a higher tile. Numbers appear near fighters, stairs, available moves, and hovered tiles. Hold
, чтобы увидеть все уровни; высокий контраст тоже показывает их постоянно. Без жетона на ненаведённой клетке нельзя делать вывод о её уровне.|to see all levels; high contrast also shows them continuously. A tile without a token when you are not hovering does not indicate its level.
Точная высота есть в нижней строке при наведении и в карточке выбранного бойца.|Exact height appears in the bottom line when hovering and in the selected fighter's card.
Подъём, обзор и падение|Climbing, sight, and falling
Обычный подъём: максимум +1 уровень; при входе на клетку лестницы — максимум +2. Стоимость шага: 1 + подъём, ещё +1 за обломки. Спуск до 2 уровней стоит обычный шаг; более глубокий спуск запрещён.|Normal climbing allows at most +1 level; entering stairs allows +2. Step cost: 1 + climb, plus 1 for rubble. Descending up to 2 levels costs a normal step; steeper descents are forbidden.
Удар сверху обычно даёт +1 урон; лучник при выстреле снизу получает −1. Толчок мечника имеет собственный базовый урон 2. Рельеф, укрытие и бойцы могут закрыть обзор.|A strike from above usually gives +1 damage; archers shooting uphill receive −1. A swordsman's push has its own base damage of 2. Terrain, cover, and fighters can block sight.
При отбрасывании вниз первые 1 уровень безопасны; каждый следующий наносит 2 урона. Вода непроходима: толчок в неё блокируется и даёт столкновение 1. Обрушение занятого моста убивает бойца.|When knocked downhill, the first level is safe; each further level deals 2 damage. Water is impassable: a push into it is blocked and causes 1 collision damage. Collapsing an occupied bridge kills the fighter.
Ответный удар|Counterattack
Как подготовить контратаку и избежать её|How to prepare and avoid a counterattack
Подготовка мечника|Preparing a swordsman
Выберите своего мечника.|Select your swordsman.
Включите|Activate
(приём) кнопкой или клавишей 2.|(ability) using its button or the 2 key.
Наведите на|Hover over
него самого|the swordsman himself
: прогноз покажет стражу.|: the preview will show guard.
Нажмите на мечника, чтобы принять стойку вместо атаки.|Click the swordsman to take a stance instead of attacking.
Стража снижает прямой входящий урон на 1 и позволяет ответить на соседний удар уроном 1, если мечник пережил все последствия. Действует до начала его следующего хода. Перемещение, если осталось, разрешено.|Guard reduces direct incoming damage by 1 and allows a 1 damage counterattack against an adjacent strike if the swordsman survives all consequences. It lasts until their next turn begins. Remaining movement is still available.
Щитоносец в страже получает защиту, но|A guarding shieldbearer gains protection but
не контратакует|does not counterattack
. Автоматических ударов по проходящему рядом врагу нет.|. There are no automatic attacks against enemies passing nearby.
Как не получить «Ответ 1»|How to avoid “Counter 1”
Ответ возможен только от мечника в страже, если атакующий стоит в соседней клетке по стороне и мечник выживает. В прогнозе перед кликом появляется|Only a guarding swordsman can counterattack, if the attacker is on an orthogonally adjacent tile and the swordsman survives. Before clicking, the preview shows
Атакуйте с дистанции: копьём через клетку или стрелой.|Attack at range: with a spear across a tile or an arrow.
Добейте мечника ударом и его последствиями — погибший не отвечает.|Finish the swordsman with the strike and its consequences: a dead fighter cannot counterattack.
Дождитесь начала его следующего хода, когда стража снимется; он может подготовить её снова.|Wait until their next turn begins and guard ends; they may prepare it again.
Толчок вплотную тоже может вызвать ответ: проверяется соседство перед ударом. Оранжевая подсветка — угроза следующего хода, а не обозначение контратаки.|An adjacent push can also trigger a counterattack: adjacency is checked before striking. Orange highlighting shows a threat next turn, rather than a counterattack.
Управление пространством|Controlling space
Натиск копейщика — удар, сдвиг, остановка|Spearman's thrust: strike, displace, pin
Копейщик бьёт через союзника и толкает врага на следующую клетку|A spearman strikes through an ally and pushes the enemy to the next tile
Враг|Enemy
Стоп|Stop
Копьё бьёт по прямой строке или столбцу на 1–2 клетки; Пикинёр — на 3. Союзник на линии не мешает, но препятствие или враг могут перекрыть линию.|Spears strike 1–2 tiles in a straight row or column; Pikemen reach 3. Allies do not obstruct the line, but obstacles or enemies may block it.
Выберите копейщика и включите «Приём» / 2.|Select a spearman and activate “Ability” / 2.
Наведите на врага на прямой линии. Прогноз показывает урон и клетку за целью.|Hover over an enemy in a straight line. The preview shows damage and the tile behind the target.
Натиск отбрасывает выжившую цель на одну клетку|Thrust pushes a surviving target one tile
дальше от копейщика|away from the spearman
. Даже удар с дистанции 2 толкает только на 1.|. Even a strike from range 2 pushes only 1 tile.
После успешного сдвига цель не может двигаться или использовать рывок|After a successful displacement the target cannot move or dash
до конца своего следующего хода|until their next turn ends
. Она всё ещё может атаковать и применять другие приёмы.|. They can still attack and use other abilities.
Когда остановка не сработает:|When pinning will not work:
Тяжёлый не отбрасывается. Если за целью вода, укрытие, другой боец или край поля, сдвига нет и остановки нет; заблокированный толчок даёт столкновение 1. Если цель погибла от прямого удара, толчка не будет. Проверяйте прогноз, а не только название приёма.|Heavy fighters cannot be pushed. Water, cover, another fighter, or the field edge behind the target prevent displacement and pinning; a blocked push causes 1 collision damage. A target killed by the direct strike is not pushed. Check the preview as well as the ability name.
Пример: вытолкните мечника из прохода — на следующем ходу он не сможет вернуться, но сможет ударить оставшегося рядом союзника. Поэтому выгодно толкать его от уязвимого бойца, в ловушку или вниз с уступа. Крюк ущелья добавляет ещё клетку сдвига, если она свободна.|For example, push a swordsman out of a passage: next turn they cannot return, but can strike an ally still nearby. Push them away from vulnerable fighters, into a trap, or off a ledge. The Gorge Hook adds one more tile of displacement if it is free.
Шесть бойцов и их специализации|Six fighters and their specializations
Ниже — базовые показатели. Специализация и снаряжение меняют их; итоговые значения смотрите при наборе и в карточке бойца.|Base stats are shown below. Specialization and equipment change them; check final values in recruitment and the fighter's card.
Для лучника дальность считается по клеткам по сторонам, а не по диагонали. Разведчик может атаковать диагонального соседа и делать рывок на клетку на расстоянии 2, в том числе по диагонали. Рывок обходит промежуточные препятствия, но требует свободной проходимой точки и перепада высот не более 1.|Archer range counts orthogonal steps, rather than diagonals. A scout can attack a diagonal neighbor and dash to a tile 2 steps away, including diagonally. Dash bypasses intermediate obstacles, but requires a free passable destination and a height difference of at most 1.
Стража щитоносца применяется приёмом по себе. Инженер ставит капкан на пустую соседнюю клетку или подрывает соседний хрупкий мост; Каменщик вместо подрыва укрепляет мост/укрытие на +2 прочности до 4. Для обычной атаки по мосту удерживайте Shift.|Use the shieldbearer's ability on themselves to guard. Engineers place a trap on an empty adjacent tile or demolish an adjacent fragile bridge; Masons reinforce a bridge or cover by +2 durability, up to 4, instead. Hold Shift for a normal attack on a bridge.
Модификаторы и артефакты|Modifiers and artifacts
, отряд 3–5 бойцов. На бойца — один модификатор и один артефакт; на отряд — максимум два артефакта. Выбирайте готовый пресет или сохраните свой состав. Свойства обеих сторон видны в карточке: наведите на подпись специализации или снаряжения.|, squad 3–5 fighters. Each fighter can have one modifier and one artifact; each squad can have at most two artifacts. Choose a preset or save your own squad. Both sides' traits appear in the card: hover over the specialization or equipment label.
Модификаторы|Modifiers
Артефакты|Artifacts
Тяжёлое снаряжение запрещено разведчику, Стремительность — щитоносцу. Крюк доступен только мечнику и копейщику; разведчик не носит стяг. Набор автоматически проверяет несовместимости.|Scouts cannot use Heavy equipment; shieldbearers cannot use Swift. The hook is available only to swordsmen and spearmen; scouts cannot carry a standard. Recruitment automatically checks incompatibilities.
Цель важнее полного разгрома|The objective matters more than total defeat
Три условия победы|Three victory conditions
Контроль:|Control:
держите минимум две точки в конце полного раунда, после ответа Ржавчины. Серия растёт на 1 и сбрасывается, если контроль потерян. В схватке цель — 5 с отрывом от противника.|hold at least two points at the end of a full round, after Rust's response. The streak increases by 1 and resets if control is lost. In a skirmish the goal is 5 with a lead over the opponent.
Командир:|Commander:
победите отмеченного ♛ бойца.|defeat the fighter marked ♛.
Весь отряд:|Entire squad:
победите всех врагов. В схватке на 12-м раунде контроль решается по счёту, другие цели — по выжившим и HP; возможна ничья.|defeat all enemies. At round 12 of a skirmish, control is decided by score and other objectives by survivors and HP; a draw is possible.
В кампании цель нужно выполнить за 12 раундов, иначе поражение. На Воротах даже уничтожение всех защитников не заменяет удержание двух точек. Точное условие всегда в панели цели.|In the campaign you must complete the objective within 12 rounds or lose. At the Gates, even defeating all defenders does not replace holding two points. The objective panel always states the exact condition.
Управление без поиска кнопок|Controls at your fingertips
ЛКМ|Left click
ПКМ|Right click
— выбрать/приказать ·|— select/order ·
— убрать выбор|— clear selection
— атака / приём ·|— attack / ability ·
— следующий свой боец|— next allied fighter
— отменить шаг ·|— undo move ·
— закончить ход|— end turn
— пауза ·|— pause ·
— все высоты|— all heights
Колесо|Wheel
— масштаб ·|— zoom ·
перетаскивание / стрелки|drag / arrow keys
— камера|— camera
— атака хрупкого моста|— attack a fragile bridge
— выбрать клетку под перекрывающим её бойцом|— select the tile under an overlapping fighter
На узком экране карточку и список открывает «Отряд», цель и прогноз остаются снизу. Чтобы проверить клетку за большим спрайтом, удерживайте Alt при наведении и клике. Партия сохраняется после каждого приказа; «Продолжить» в меню восстанавливает её. Пауза останавливает ИИ.|On a narrow screen, “Squad” opens the card and list; the objective and preview stay below. Hold Alt while hovering or clicking to inspect a tile behind a large sprite. The game saves after every order; “Continue” in the menu restores it. Pause stops the AI.
На планшете|On a tablet
Коснитесь бойца, затем клетки или цели. Первое касание цели только показывает прогноз. Проверьте урон и последствия, затем нажмите|Tap a fighter, then a tile or target. The first tap on a target only previews it. Check damage and consequences, then press
Подтвердить шаг / атаку / приём|Confirm move / attack / ability
. Для способности нажмите постоянную кнопку|. To use an ability, press the persistent
с её названием внизу экрана. Затем коснитесь цели и подтвердите. Для стражи цель — сам боец.|button with its name at the bottom of the screen. Then tap a target and confirm. For guard, target the fighter themselves.
Один палец|One finger
— перетаскивание карты;|— drag the map;
два пальца|two fingers
— масштаб. Жест камеры или поворот экрана сбрасывает подготовленный приказ. «Отряд» открывает карточку и список; подписи снаряжения раскрывают описание при касании.|— zoom. Camera gestures or screen rotation clear the prepared order. “Squad” opens the card and list; tapping equipment labels reveals descriptions.
выбирает землю за перекрывающей её фигурой.|selects the ground behind an overlapping figure.
заменяет Shift;|replaces Shift;
показывает все уровни;|shows all levels;
убирает выбор и прогноз. Отмена шага, завершение хода и пауза доступны экранными кнопками.|clears selection and preview. Onscreen buttons also provide undo move, end turn, and pause.
Esc тоже возвращает в меню.|Esc also returns to the menu.
`.trim().split('\n').map(line => { const index = line.indexOf('|'); return [line.slice(0, index), line.slice(index + 1)]; }));
