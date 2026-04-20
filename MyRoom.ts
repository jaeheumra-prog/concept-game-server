import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./MyRoomState";

export class MyRoom extends Room<MyRoomState> {
    onCreate(options: any) {
        this.setState(new MyRoomState());

        // ⏱️ 글로벌 타이머 루프 (1초마다 감소)
        this.clock.setInterval(() => {
            if (this.state.timeRemaining > 0) {
                this.state.timeRemaining -= 1;
            }
        }, 1000);

        // 🎮 플레이어 상호작용 및 아이템 로직
        this.onMessage("interact", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) return;

            const { action, targetId, targetType, reqId } = message;

            // 1. 아이템 획득
            if (action === "pickItem") {
                if (this.state.mapStatus.get(targetId) !== "picked") {
                    this.state.mapStatus.set(targetId, "picked");
                    this.state.itemsCollected += 1;
                    player.inventory.push(message.targetName);
                    this.broadcast("itemPicked", { id: targetId, by: player.realName, itemName: message.targetName });
                }
            }

            // 2. 일반 직업별 길 열기 (벽 부수기, 다리 놓기, 퍼즐)
            if (action === "openPath") {
                if (this.state.mapStatus.get(targetId) !== "opened") {
                    this.state.mapStatus.set(targetId, "opened");
                    this.broadcast("pathOpened", { id: targetId, type: targetType, by: player.realName });
                }
            }

            // 3. [방 5] 금고 열기 (팀원 중 누군가 열쇠 발판 위에 있어야 함)
            if (action === "openSafe") {
                if (this.state.mapStatus.get(targetId) !== "opened") {
                    let isKeyActive = false;
                    this.state.players.forEach(p => {
                        if (p.group === player.group && Math.hypot(p.x - message.keyX, p.y - message.keyY) < 60) isKeyActive = true;
                    });

                    if (isKeyActive) {
                        this.state.mapStatus.set(targetId, "opened");
                        this.broadcast("pathOpened", { id: targetId, type: "safe", by: player.realName });
                    } else {
                        client.send("serverMessage", "🔒 다른 팀원이 [열쇠 발판]을 밟아주어야 합니다!");
                    }
                }
            }

            // 4. [방 10] 중량 센서 문 (두 명의 팀원이 각각의 발판을 밟고 있어야 함)
            if (action === "openDualDoor") {
                if (this.state.mapStatus.get(targetId) !== "opened") {
                    let onKey1 = false; let onKey2 = false;
                    this.state.players.forEach(p => {
                        if (p.group === player.group) {
                            if (Math.hypot(p.x - message.key1X, p.y - message.key1Y) < 60) onKey1 = true;
                            if (Math.hypot(p.x - message.key2X, p.y - message.key2Y) < 60) onKey2 = true;
                        }
                    });

                    if (onKey1 && onKey2) {
                        this.state.mapStatus.set(targetId, "opened");
                        this.broadcast("pathOpened", { id: targetId, type: "dual_door", by: player.realName });
                    } else {
                        client.send("serverMessage", "⚖️ 두 개의 발판을 동시에 밟아야 문이 열립니다!");
                    }
                }
            }

            // 5. [방 11] 연계 기믹 (개척자가 바위를 부순 상태여야 분석가가 금고를 열 수 있음)
            if (action === "openTwoStepSafe") {
                if (this.state.mapStatus.get(reqId) === "opened" && this.state.mapStatus.get(targetId) !== "opened") {
                    this.state.mapStatus.set(targetId, "opened");
                    this.broadcast("pathOpened", { id: targetId, type: "safe", by: player.realName });
                } else {
                    client.send("serverMessage", "🪨 암석을 먼저 파괴해야 금고를 열 수 있습니다!");
                }
            }
        });

        // 🎒 인벤토리 아이템 소비 로직
        this.onMessage("useItem", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) return;

            const index = message.itemIndex;
            const itemName = player.inventory[index];

            if (itemName) {
                player.inventory.splice(index, 1); // 인벤토리에서 제거

                // 아이템 효과 분류
                const timeItems = ["감자", "vlog", "시계", "케이크"];
                const atkItems = ["!", "조이스틱", "레이싱카", "음표", "곰", "dance"];
                const speedItems = ["바퀴"];
                const stunItems = ["찰흙", "향수", "거울"];
                const weakItems = ["미생물", "찢어진종이조각"];

                if (timeItems.includes(itemName)) {
                    this.state.timeRemaining += (itemName === "케이크" ? 4 : 3);
                    this.broadcast("serverMessage", `⏳ ${player.realName}님이 [${itemName}] 사용! 제한 시간이 늘어납니다.`);
                } else if (atkItems.includes(itemName)) {
                    client.send("applyBuff", { type: "attack", duration: 3000, multiplier: 2 });
                } else if (speedItems.includes(itemName)) {
                    client.send("applyBuff", { type: "speed", duration: 3000, multiplier: 2 });
                } else if (stunItems.includes(itemName)) {
                    this.broadcast("serverMessage", `🛑 ${player.realName}님이 [${itemName}] 사용! 보스가 3초간 묶입니다.`);
                } else if (weakItems.includes(itemName)) {
                    this.broadcast("serverMessage", `👁️ ${player.realName}님이 [${itemName}] 사용! 보스의 약점이 보입니다.`);
                }
            }
        });

        // ... 기존 onJoin, onLeave, coordinatorTeleport 핸들러 유지 ...
    }
}


/*
import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./MyRoomState";

export class MyRoom extends Room<MyRoomState> {
    onCreate(options: any) {
        this.setState(new MyRoomState());

        this.clock.setInterval(() => {
            if (this.state.timeRemaining > 0) this.state.timeRemaining -= 1;
        }, 1000);

        this.onMessage("interact", (client, message) => {
            // ... 기존 interact 로직(pickItem, openPath, openSafe 등) 동일하게 유지 ... 
            // (코드 길이가 길어지므로 이전 메시지 핸들러 내용은 그대로 두시면 됩니다!)
        });

        // 🌟 보스 공격 처리
        this.onMessage("attackBoss", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (!player || this.state.boss.hp <= 0) return;

            // 거리 검사 (너무 멀면 공격 안 됨)
            const dist = Math.hypot(player.x - this.state.boss.x, player.y - this.state.boss.y);
            if (dist > 120) return; 

            // 기본 데미지 10 * 아이템 공격력 버프(message.attackPower)
            let damage = 10 * (message.attackPower || 1);
            
            // 미생물 등으로 보스가 '약점(weak)' 상태라면 데미지 2배
            if (this.state.boss.status === "weak") damage *= 2;

            this.state.boss.hp = Math.max(0, this.state.boss.hp - damage);
            
            // 클라이언트들에게 타격 애니메이션 및 데미지 텍스트 띄우라고 방송
            this.broadcast("bossHit", { damage: damage, x: this.state.boss.x, y: this.state.boss.y });

            if (this.state.boss.hp === 0 && this.state.mapStatus.get("boss_defeated") !== "true") {
                this.state.mapStatus.set("boss_defeated", "true");
                this.broadcast("serverMessage", "🎉 하동환 교수를 물리쳤습니다! 조교를 구출하세요!");
            }
        });

        this.onMessage("useItem", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) return;

            const index = message.itemIndex;
            const itemName = player.inventory[index];

            if (itemName) {
                player.inventory.splice(index, 1); 

                const timeItems = ["감자", "vlog", "시계", "케이크"];
                const atkItems = ["!", "조이스틱", "레이싱카", "음표", "곰", "dance"];
                const speedItems = ["바퀴"];
                const stunItems = ["찰흙", "향수", "거울"];
                const weakItems = ["미생물", "찢어진종이조각"];

                if (timeItems.includes(itemName)) {
                    this.state.timeRemaining += (itemName === "케이크" ? 4 : 3);
                    this.broadcast("serverMessage", `⏳ [${itemName}] 사용! 제한 시간이 늘어납니다.`);
                } else if (atkItems.includes(itemName)) {
                    client.send("applyBuff", { type: "attack", duration: 3000, multiplier: 2 });
                } else if (speedItems.includes(itemName)) {
                    client.send("applyBuff", { type: "speed", duration: 3000, multiplier: 2 });
                } 
                // 🌟 보스 디버프 로직 활성화
                else if (stunItems.includes(itemName)) {
                    this.state.boss.status = "stunned";
                    this.broadcast("serverMessage", `🛑 [${itemName}] 사용! 보스가 3초간 기절합니다.`);
                    this.clock.setTimeout(() => { if (this.state.boss.hp > 0) this.state.boss.status = "idle"; }, 3000);
                } else if (weakItems.includes(itemName)) {
                    this.state.boss.status = "weak";
                    this.broadcast("serverMessage", `👁️ [${itemName}] 사용! 5초간 보스의 약점이 노출되어 데미지 2배!`);
                    this.clock.setTimeout(() => { if (this.state.boss.hp > 0) this.state.boss.status = "idle"; }, 5000);
                }
            }
        });
    }
}
*/

/*
if (action === "openPath") {
    if (this.state.mapStatus.get(targetId) !== "opened") {
        this.state.mapStatus.set(targetId, "opened");
        // 클라이언트들에게 길이 열렸음을 알림 (다리가 생기거나 벽이 부서짐)
        this.broadcast("pathOpened", { id: targetId, type: message.targetType });
    }
}
*/

/*
// 🌟 MyRoom.ts - this.onMessage("interact", ...) 내부 조건문에 추가

if (action === "revealPath") {
    if (this.state.mapStatus.get(targetId) !== "revealed") {
        this.state.mapStatus.set(targetId, "revealed"); // 상태를 '밝혀짐'으로 변경
        this.broadcast("pathRevealed", { id: targetId, by: player.realName });
    }
}
*/
