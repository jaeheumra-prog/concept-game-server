// LEGACY PROJECT COMMENTED OUT FOR NEW PROJECT START
// Original file: server\MyRoomState.ts
// import { Schema, type } from "@colyseus/schema";
// 
// // 플레이어 개별 상태
// export class Player extends Schema {
//     @type("number") x: number = 400;
//     @type("number") y: number = 300;
//     @type("string") job: string;
//     @type("string") character: string;
//     @type("string") group: string;
// }
// 
// // 전체 방 상태
// export class MyRoomState extends Schema {
//     // 💡 아이템 획득 총합을 관리할 변수 추가
//     @type("number") itemsCollected: number = 0;
// 
//     // 플레이어 목록
//     @type({ map: Player }) players = new Map<string, Player>();
// }
// 
// /*
// import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
// 
// // 플레이어 개별 상태
// export class Player extends Schema {
//     @type("number") x: number = 400;
//     @type("number") y: number = 300;
//     @type("string") job: string;
//     @type("string") character: string;
//     @type("string") group: string;
//     @type("string") realName: string;
// 
//     // 💡 플레이어별 인벤토리
//     @type(["string"]) inventory = new ArraySchema<string>();
// }
// 
// // 전체 방 상태
// export class MyRoomState extends Schema {
//     @type("number") itemsCollected: number = 0;
// 
//     // 플레이어 목록
//     @type({ map: Player }) players = new MapSchema<Player>();
// 
//     // 💡 맵 상태 기록 (아이템 "picked" 또는 장애물 "opened")
//     @type({ map: "string" }) mapStatus = new MapSchema<string>();
// }
// 
// /*
// import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
// 
// export class Player extends Schema {
//     @type("number") x: number = 400;
//     @type("number") y: number = 300;
//     @type("string") job: string;
//     @type("string") character: string;
//     @type("string") group: string;
//     @type("string") realName: string;
//     @type(["string"]) inventory = new ArraySchema<string>();
// }
// 
// // 🌟 최종 보스 스키마 추가
// export class Boss extends Schema {
//     @type("number") x: number = 400;
//     @type("number") y: number = 150;
//     @type("number") hp: number = 1000;
//     @type("number") maxHp: number = 1000;
//     @type("string") status: string = "idle"; // idle, stunned, weak
// }
// 
// export class MyRoomState extends Schema {
//     @type("number") itemsCollected: number = 0;
//     @type("number") timeRemaining: number = 300; 
// 
//     @type({ map: Player }) players = new MapSchema<Player>();
//     @type({ map: "string" }) mapStatus = new MapSchema<string>();
//     
//     // 🌟 보스 객체 생성
//     @type(Boss) boss = new Boss();
// }
// 
// */
// 
// /*
// 
// import * as Phaser from 'phaser';
// import { Client } from 'colyseus.js';
// 
// // Render 배포 서버는 `coordinatorTeleport` 핸들러가 없으면 이동이 반영되지 않습니다.
// // 로컬 테스트: `server` 폴더에서 npm install && npm start 후, HTML에 아래 한 줄을 넣거나
// // 이 상수를 'ws://127.0.0.1:2567' 로 바꿉니다.
// // <script>window.__COLYSEUS_ENDPOINT__ = 'ws://127.0.0.1:2567'</script>
// const COLYSEUS_URL =
//   (typeof window !== 'undefined' && window.__COLYSEUS_ENDPOINT__) ||
//   'wss://concept-game-server.onrender.com';
// 
// // 📊 1조 ~ 11조 전체 팀원 데이터
// const PLAYER_DATA = {
//   1: {
//     "김민재": { job: "분석자(창의)", character: "test_buddy1" },
//     "박채연": { job: "개척자(성실)", character: "test_buddy2" },
//     "손유정": { job: "길잡이(외향)", character: "test_buddy3" },
//     "이승환": { job: "조율자(협력)", character: "test_buddy4" },
//     "이연재": { job: "설계자(신경)", character: "test_buddy5" }
//   },
//   2: {
//     "윤현근": { job: "분석자(창의)", character: "test_buddy1" },
//     "심나이": { job: "개척자(성실)", character: "test_buddy2" },
//     "이율":   { job: "조율자(협력)", character: "test_buddy4" },
//     "남윤주": { job: "설계자(신경)", character: "test_buddy5" }
//   },
//   3: {
//     "안비비안": { job: "분석자(창의)", character: "test_buddy1" },
//     "이택준": { job: "개척자(성실)", character: "test_buddy2" },
//     "송수현": { job: "길잡이(외향)", character: "test_buddy3" },
//     "김찬영": { job: "조율자(협력)", character: "test_buddy4" }
//   },
//   4: {
//     "김가윤": { job: "분석자(창의)", character: "test_buddy1" },
//     "김수지": { job: "개척자(성실)", character: "test_buddy2" },
//     "김재현": { job: "길잡이(외향)", character: "test_buddy3" },
//     "이용은": { job: "조율자(협력)", character: "test_buddy4" },
//     "현동건": { job: "설계자(신경)", character: "test_buddy5" }
//   },
//   5: {
//     "라재흠": { job: "분석자(창의)", character: "test_buddy1" },
//     "이정훈": { job: "개척자(성실)", character: "test_buddy2" },
//     "이지원": { job: "길잡이(외향)", character: "test_buddy3" },
//     "홍원준": { job: "조율자(협력)", character: "test_buddy4" }
//   },
//   6: {
//     "석민정": { job: "분석자(창의)", character: "test_buddy1" },
//     "손채빈": { job: "개척자(성실)", character: "test_buddy2" },
//     "안은기": { job: "길잡이(외향)", character: "test_buddy3" },
//     "홍석준": { job: "조율자(협력)", character: "test_buddy4" }
//   },
//   7: {
//     "민승기": { job: "분석자(창의)", character: "test_buddy1" },
//     "하윤채": { job: "개척자(성실)", character: "test_buddy2" },
//     "강민서": { job: "길잡이(외향)", character: "test_buddy3" },
//     "최재석": { job: "조율자(협력)", character: "test_buddy4" }
//   },
//   8: {
//     "김유찬": { job: "분석자(창의)", character: "test_buddy1" },
//     "박승훈": { job: "개척자(성실)", character: "test_buddy2" },
//     "박재현": { job: "길잡이(외향)", character: "test_buddy3" },
//     "배지우": { job: "조율자(협력)", character: "test_buddy4" }
//   },
//   9: {
//     "김담희": { job: "분석자(창의)", character: "test_buddy1" },
//     "이기서": { job: "개척자(성실)", character: "test_buddy2" },
//     "장윤서": { job: "길잡이(외향)", character: "test_buddy3" },
//     "박민우": { job: "조율자(협력)", character: "test_buddy4" },
//     "박지연": { job: "설계자(신경)", character: "test_buddy5" }
//   },
//   10: {
//     "설진":   { job: "분석자(창의)", character: "test_buddy1" },
//     "장원우": { job: "개척자(성실)", character: "test_buddy2" },
//     "이지민": { job: "길잡이(외향)", character: "test_buddy3" },
//     "이지훈": { job: "조율자(협력)", character: "test_buddy4" },
//     "김태성": { job: "설계자(신경)", character: "test_buddy5" }
//   },
//   11: {
//     "김수현": { job: "분석자(창의)", character: "test_buddy1" },
//     "이성주": { job: "개척자(성실)", character: "test_buddy2" },
//     "최시현": { job: "길잡이(외향)", character: "test_buddy3" },
//     "이승회": { job: "조율자(협력)", character: "test_buddy4" },
//     "황유주": { job: "설계자(신경)", character: "test_buddy5" }
//   },
//   999: {
//     "테스터": { job: "조율자", character: "test_buddy4" }
//   }
// };
// 
// class LoginScene extends Phaser.Scene {
//   constructor() { super({ key: 'LoginScene' }); }
//   create() {
//     const ui = document.getElementById('login-ui');
//     const nameInput = document.getElementById('name-input');
//     const groupInput = document.getElementById('group-input');
//     const jobDisplay = document.getElementById('job-display');
//     ui.style.display = 'flex';
// 
//     const updateJobDisplay = () => {
//       const inputName = nameInput.value.trim();
//       const groupValue = groupInput.value.trim();
//       
//       if (!inputName || !groupValue) {
//         jobDisplay.textContent = '직업: (이름과 조를 입력해주세요)';
//         jobDisplay.style.color = '#ffeb3b';
//         return;
//       }
//       
//       if (PLAYER_DATA[groupValue]) {
//         const playerInfo = PLAYER_DATA[groupValue][inputName];
//         if (playerInfo) {
//           jobDisplay.textContent = `직업: ${playerInfo.job}`;
//           jobDisplay.style.color = '#00ff00';
//         } else {
//           jobDisplay.textContent = '등록되지 않은 이름입니다.';
//           jobDisplay.style.color = '#ff4444';
//         }
//       } else {
//         jobDisplay.textContent = '등록되지 않은 조입니다.';
//         jobDisplay.style.color = '#ff4444';
//       }
//     };
// 
//     nameInput.addEventListener('input', updateJobDisplay);
//     groupInput.addEventListener('input', updateJobDisplay);
// 
//     document.getElementById('login-button').onclick = async () => {
//       const inputName = nameInput.value.trim();
//       const groupValue = groupInput.value.trim();
//       
//       if (!PLAYER_DATA[groupValue]) return alert('등록되지 않은 조 번호입니다!');
//       const playerInfo = PLAYER_DATA[groupValue][inputName];
//       if (!playerInfo) return alert('등록되지 않은 이름입니다!');
//       
//       const client = new Client(COLYSEUS_URL);
//       try {
//         const room = await client.joinOrCreate('my_room', { ...playerInfo, group: groupValue, realName: inputName });
//         ui.style.display = 'none';
//         this.scene.start('GameScene', { room, myInfo: { ...playerInfo, group: groupValue } });
//       } catch (e) { alert('서버 접속 실패! ' + e.message); }
//     };
//   }
// }
// 
// class GameScene extends Phaser.Scene {
//   constructor() { super({ key: 'GameScene' }); }
//   
//   init(data) {
//     this.room = data.room;
//     this.myInfo = data.myInfo;
//     this.playerSprites = {};
//     this.mySprite = null;
//     this.isChangeScene = false;
//     this.coordSkillMode = 'idle';
//     this.coordSkillTargetId = null;
//     this._coordPointerHandler = null;
//     this.coordOverlayRoot = null;
//   }
// 
//   preload() {
//     this.load.image('tiles', '/assets/test.1.png'); 
//     this.load.tilemapTiledJSON('map', '/assets/7floor.tmj'); 
//     this.load.image('item', '/assets/item.png');
// 
//     this.load.image('img1', '/assets/test.1.png');
//     this.load.image('img2', '/assets/test.3.png');
//     this.load.image('img3', '/assets/KakaoTalk_Photo_2026-04-17-13-18-25-005.png');
//     this.load.image('img4', '/assets/KakaoTalk_Photo_2026-04-17-13-18-25-002.png');
//     
//     for (let i = 1; i <= 5; i++) {
//       this.load.image(`test_buddy${i}`, `/assets/test_buddy${i}.png`);
//     }
//   }
// 
//   ensureCoordOverlay() {
//     if (this.coordOverlayRoot) return this.coordOverlayRoot;
//     const parent = document.getElementById('game-container');
//     if (!parent) return null;
//     const root = document.createElement('div');
//     root.id = 'coord-skill-overlay';
//     root.style.cssText = [
//       'display:none',
//       'position:absolute',
//       'inset:0',
//       'z-index:150',
//       'pointer-events:auto',
//       'font-family:sans-serif',
//       'box-sizing:border-box'
//     ].join(';');
//     root.innerHTML = `
//       <div id="coord-skill-panel" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
//         width:min(360px,92%);max-height:70%;overflow:auto;background:#1a1a1a;color:#fff;border:2px solid #00ff00;
//         border-radius:10px;padding:14px 16px;box-shadow:0 8px 24px rgba(0,0,0,.6);">
//         <div id="coord-skill-title" style="font-size:17px;font-weight:bold;margin-bottom:10px;text-align:center;">팀원 선택</div>
//         <div id="coord-skill-hint" style="font-size:13px;color:#ccc;margin-bottom:12px;text-align:center;line-height:1.4;"></div>
//         <div id="coord-skill-list" style="display:flex;flex-direction:column;gap:8px;"></div>
//         <button type="button" id="coord-skill-cancel" style="margin-top:14px;width:100%;padding:10px;border-radius:8px;border:none;
//           background:#444;color:#fff;font-size:14px;cursor:pointer;">닫기 (ESC)</button>
//       </div>
//     `;
//     parent.appendChild(root);
//     root.querySelector('#coord-skill-cancel').onclick = () => this.closeCoordinatorSkillFlow();
//     this.coordOverlayRoot = root;
//     return root;
//   }
// 
//   closeCoordinatorSkillFlow() {
//     this.coordSkillMode = 'idle';
//     this.coordSkillTargetId = null;
//     if (this._coordPointerHandler) {
//       this.input.off('pointerdown', this._coordPointerHandler);
//       this._coordPointerHandler = null;
//     }
//     if (this.coordOverlayRoot) {
//       this.coordOverlayRoot.style.display = 'none';
//     }
//     if (this.scoreText && this._baseHudText) {
//       this.scoreText.setText(this._baseHudText);
//     }
//   }
// 
//   openCoordinatorSkillFlow() {
//     if (this.myInfo.character !== 'test_buddy4') return;
//     const root = this.ensureCoordOverlay();
//     if (!root) return;
//     this.coordSkillMode = 'picking';
//     this.coordSkillTargetId = null;
//     if (this._coordPointerHandler) {
//       this.input.off('pointerdown', this._coordPointerHandler);
//       this._coordPointerHandler = null;
//     }
//     root.style.display = 'block';
//     const title = root.querySelector('#coord-skill-title');
//     const hint = root.querySelector('#coord-skill-hint');
//     const list = root.querySelector('#coord-skill-list');
//     title.textContent = '이동시킬 팀원 선택';
//     hint.textContent = '같은 모둠 팀원(본인 포함)을 클릭한 뒤, 맵에서 이동할 위치를 클릭합니다.';
//     list.innerHTML = '';
// 
//     const myGroup = String(this.myInfo.group);
//     this.room.state.players.forEach((player, sessionId) => {
//       if (String(player.group) !== myGroup) return;
//       const name = (player.realName && String(player.realName).trim()) || '(이름 없음)';
//       const job = player.job || '';
//       const ch = player.character || '';
//       const row = document.createElement('button');
//       row.type = 'button';
//       row.style.cssText = 'text-align:left;padding:10px 12px;border-radius:8px;border:1px solid #333;background:#2a2a2a;color:#fff;cursor:pointer;font-size:14px;';
//       row.innerHTML = `<span style="color:#7dff9a;font-weight:bold;">${name}</span><br/><span style="color:#aaa;font-size:12px;">${job} · ${ch}</span>`;
//       row.onmouseenter = () => { row.style.background = '#333'; };
//       row.onmouseleave = () => { row.style.background = '#2a2a2a'; };
//       row.onclick = () => {
//         this.coordSkillTargetId = sessionId;
//         this.coordSkillMode = 'placing';
//         list.innerHTML = '';
//         root.style.display = 'none';
//         if (this.scoreText && this._baseHudText) {
//           this.scoreText.setText(
//             `${this._baseHudText} — ${name} 이동: 맵 클릭 (ESC/Shift 취소)`
//           );
//         }
//         this.attachPlacingPointer();
//       };
//       list.appendChild(row);
//     });
// 
//     if (!list.children.length) {
//       hint.textContent = '같은 모둠으로 접속한 플레이어가 없습니다.';
//     }
//   }
// 
//   attachPlacingPointer() {
//     if (this._coordPointerHandler) {
//       this.input.off('pointerdown', this._coordPointerHandler);
//     }
//     this._coordPointerHandler = (pointer) => {
//       if (this.coordSkillMode !== 'placing' || !this.coordSkillTargetId) return;
//       const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
//       this.room.send('coordinatorTeleport', {
//         targetSessionId: this.coordSkillTargetId,
//         x: world.x,
//         y: world.y
//       });
//       this.closeCoordinatorSkillFlow();
//     };
//     this.input.on('pointerdown', this._coordPointerHandler);
//   }
// 
//   create() {
//     this.cameras.main.setBackgroundColor('#2c3e50');
// 
//     try {
//         const map = this.make.tilemap({ key: 'map' });
// 
//         const tiles1 = map.addTilesetImage('test.1', 'img1');
//         const tiles2 = map.addTilesetImage('test.3', 'img2');
//         const tiles3 = map.addTilesetImage('KakaoTalk_Photo_2026-04-17-13-18-25 005', 'img3');
//         const tiles4 = map.addTilesetImage('KakaoTalk_Photo_2026-04-17-13-18-25 002', 'img4');
// 
//         const allTiles = [tiles1, tiles2, tiles3, tiles4].filter(t => t !== null);
// 
//         if (allTiles.length > 0) {
//             map.layers.forEach(layer => {
//                 const createdLayer = map.createLayer(layer.name, allTiles, 0, 0);
//                 
//                 if (createdLayer && layer.name.includes('벽')) {
//                     createdLayer.setCollisionByProperty({ collides: true });
//                 }
//             });
//         }
//     } catch (e) {
//         console.warn("맵을 불러오는 데 실패했습니다. 에셋 경로를 확인하세요.", e);
//     }
// 
//     let uiText = `[ ${this.myInfo.group}모둠 ] 접속 성공`;
//     if (this.myInfo.character === "test_buddy4") uiText += " (Shift: 팀원 이동 지정)";
//     this._baseHudText = uiText;
//     
//     this.scoreText = this.add.text(10, 10, uiText, { 
//         font: '20px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
//     }).setScrollFactor(0).setDepth(100);
// 
//     this.cursors = this.input.keyboard.createCursorKeys();
//     this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
//     this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESCAPE);
// 
//     this.room.onStateChange(() => this.syncPlayers());
// 
//     this.events.once('shutdown', () => {
//       this.closeCoordinatorSkillFlow();
//       if (this.coordOverlayRoot && this.coordOverlayRoot.parentNode) {
//         this.coordOverlayRoot.parentNode.removeChild(this.coordOverlayRoot);
//       }
//       this.coordOverlayRoot = null;
//     });
//   }
// 
//   syncPlayers() {
//     this.room.state.players.forEach((player, sessionId) => {
//       if (!this.playerSprites[sessionId]) {
//         const sprite = this.physics.add.image(player.x, player.y, player.character);
//         sprite.setScale(0.8).setDepth(90); 
//         this.playerSprites[sessionId] = sprite;
// 
//         const label = this.add.text(player.x, player.y - 45, player.job, { font: '14px Arial', fill: '#ffffff' }).setOrigin(0.5);
//         this.playerSprites[sessionId].label = label;
//         this.playerSprites[sessionId].label.setDepth(100);
// 
//         if (sessionId === this.room.sessionId) {
//           this.mySprite = sprite;
//         }
//       } else {
//         const sprite = this.playerSprites[sessionId];
//         sprite.x = player.x;
//         sprite.y = player.y;
//         if (sprite.label) {
//           sprite.label.x = player.x;
//           sprite.label.y = player.y - 45;
//         }
//       }
//     });
//   }
// 
//   update() {
//     if (!this.room || !this.mySprite) return;
// 
//     if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
//       if (this.coordSkillMode !== 'idle') this.closeCoordinatorSkillFlow();
//     }
// 
//     if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
//       if (this.myInfo.character === "test_buddy4") {
//         if (this.coordSkillMode !== 'idle') {
//           this.closeCoordinatorSkillFlow();
//         } else {
//           this.openCoordinatorSkillFlow();
//         }
//       }
//     }
// 
//     if (this.coordSkillMode !== 'idle') return;
// 
//     if (this.cursors.left.isDown) this.room.send("move", { dir: "left" });
//     else if (this.cursors.right.isDown) this.room.send("move", { dir: "right" });
//     if (this.cursors.up.isDown) this.room.send("move", { dir: "up" });
//     else if (this.cursors.down.isDown) this.room.send("move", { dir: "down" });
//   }
// }
// 
// const config = {
//   type: Phaser.AUTO, width: 800, height: 600,
//   parent: 'game-container', scene: [LoginScene, GameScene],
//   physics: { default: 'arcade', arcade: { debug: false } }
// };
// new Phaser.Game(config);
// 
// */
// 
// /*
// 
// // 🌟 MyRoom.ts 내부에 분석 함수 추가
// generateAIReport() {
//     const report = [];
//     let maxDamage = 0; let topDealer = "";
//     let maxCoop = 0; let topHelper = "";
//     let maxDist = 0; let topRunner = "";
//     let maxInteract = 0; let topExplorer = "";
// 
//     // 1. 최고 기록자 찾기
//     this.state.players.forEach((p) => {
//         if (p.stats.bossDamage > maxDamage) { maxDamage = p.stats.bossDamage; topDealer = p.realName; }
//         if (p.stats.coopScore > maxCoop) { maxCoop = p.stats.coopScore; topHelper = p.realName; }
//         if (p.stats.distance > maxDist) { maxDist = p.stats.distance; topRunner = p.realName; }
//         if (p.stats.interactions > maxInteract) { maxInteract = p.stats.interactions; topExplorer = p.realName; }
//     });
// 
//     // 2. 유저별 맞춤형 분석지 작성
//     this.state.players.forEach((p) => {
//         let title = "조용한 관찰자"; // 기본값
//         let comment = "게임의 흐름을 지켜보며 팀원들과 함께했습니다.";
// 
//         // 분석 알고리즘 (우선순위 부여)
//         if (p.realName === topDealer && maxDamage > 0) {
//             title = "🔥 압도적인 딜러";
//             comment = `보스에게 무려 ${maxDamage}의 피해를 입혔습니다! 교수를 쓰러뜨린 일등 공신입니다.`;
//         } else if (p.realName === topHelper && maxCoop > 0) {
//             title = "🤝 최고의 협력자";
//             comment = `협동 기믹을 풀기 위해 가장 많이 헌신했습니다. 이 팀워크가 아니었다면 클리어하지 못했을 겁니다.`;
//         } else if (p.realName === topExplorer && maxInteract > 0) {
//             title = "🔍 맵 탐험가";
//             comment = `총 ${maxInteract}번의 상호작용을 통해 맵 곳곳의 비밀을 가장 먼저 파헤쳤습니다.`;
//         } else if (p.realName === topRunner && maxDist > 0) {
//             title = "🏃 발바닥 땀난 팀원";
//             comment = `맵 전체를 쉴 새 없이 뛰어다녔습니다. 엄청난 활동량으로 팀의 시야를 넓혀주었습니다.`;
//         } else if (p.stats.skillUses > 5) {
//             title = "✨ 직업 마스터";
//             comment = `자신의 직업 스킬을 적재적소에 완벽하게 활용하여 난관을 극복했습니다.`;
//         }
// 
//         report.push({
//             name: p.realName,
//             job: p.job,
//             title: title,
//             comment: comment,
//             stats: {
//                 damage: p.stats.bossDamage,
//                 coop: p.stats.coopScore,
//                 interact: p.stats.interactions
//             }
//         });
//     });
// 
//     return report;
// }
// 
// // 🌟 게임 종료 로직에서 보고서 클라이언트로 전송
// // (기존 보스 체력이 0이 되는 부분에 추가)
// if (this.state.boss.hp === 0 && this.state.mapStatus.get("boss_defeated") !== "true") {
//     this.state.mapStatus.set("boss_defeated", "true");
//     
//     // 1. 게임 종료 메시지 전송
//     this.broadcast("serverMessage", "🎉 하동환 교수를 물리쳤습니다! 잠시 후 분석 결과가 나옵니다.");
//     
//     // 2. 2초 뒤에 AI 분석 보고서를 생성하여 모든 클라이언트로 전송
//     this.clock.setTimeout(() => {
//         const finalReport = this.generateAIReport();
//         this.broadcast("gameEnded", { result: "win", report: finalReport });
//     }, 2000);
// }
// 
// */
// LEGACY PROJECT COMMENTED OUT END
