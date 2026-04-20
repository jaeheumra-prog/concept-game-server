import { Server, Room, Client } from "colyseus";
import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import http from "http";

const WORLD_BOUNDS = { width: 1020, height: 1020 };

type ItemEffectType = "attack" | "speed" | "attackSpeed" | "stun" | "weak" | "time";

const ITEM_EFFECTS: Record<string, { type: ItemEffectType; duration?: number; multiplier?: number; seconds?: number }> = {
  "!": { type: "attack", duration: 3000, multiplier: 2 },
  "감자 고추 말차 딸기 케이크": { type: "time", seconds: 4 },
  "바퀴": { type: "speed", duration: 3000, multiplier: 2 },
  "미생물": { type: "weak", duration: 5000 },
  "조이스틱": { type: "attack", duration: 3000, multiplier: 2 },
  "찰흙": { type: "stun", duration: 3000 },
  "레이싱카": { type: "attackSpeed", duration: 3000, multiplier: 2 },
  "향수": { type: "stun", duration: 3000 },
  "vlog": { type: "time", seconds: 3 },
  "찢어진 종이 조각": { type: "weak", duration: 5000 },
  "거울": { type: "stun", duration: 3000 },
  "음표": { type: "attack", duration: 3000, multiplier: 2 },
  "시계": { type: "time", seconds: 3 },
  "곰": { type: "attack", duration: 3000, multiplier: 2 },
  "dance": { type: "attack", duration: 3000, multiplier: 2 },
};

class Player extends Schema {
  @type("number") x: number = 120;
  @type("number") y: number = 120;
  @type("string") character: string = "";
  @type("string") job: string = "";
  @type("string") roleKey: string = "";
  @type("string") group: string = "";
  @type("string") realName: string = "";
  @type("number") vision: number = 150;
  @type(["string"]) inventory = new ArraySchema<string>();
}

class Boss extends Schema {
  @type("number") x: number = 900;
  @type("number") y: number = 900;
  @type("number") hp: number = 500;
  @type("number") maxHp: number = 500;
  @type("string") status: string = "idle";
}

class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: "string" }) mapStatus = new MapSchema<string>();
  @type("number") itemsCollected: number = 0;
  @type("number") timeRemaining: number = 300;
  @type(Boss) boss = new Boss();
}

class GameRoom extends Room<GameState> {
  onCreate() {
    this.setState(new GameState());

    this.clock.setInterval(() => {
      if (this.state.timeRemaining > 0 && this.state.boss.hp > 0) {
        this.state.timeRemaining -= 1;
      }
    }, 1000);

    this.onMessage("movePos", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.x = clamp(Number(data.x) || player.x, 0, WORLD_BOUNDS.width);
      player.y = clamp(Number(data.y) || player.y, 0, WORLD_BOUNDS.height);
    });

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const speed = 7;
      if (data.dir === "left") player.x -= speed;
      if (data.dir === "right") player.x += speed;
      if (data.dir === "up") player.y -= speed;
      if (data.dir === "down") player.y += speed;
      player.x = clamp(player.x, 0, WORLD_BOUNDS.width);
      player.y = clamp(player.y, 0, WORLD_BOUNDS.height);
    });

    this.onMessage("interact", (client, data) => {
      if (data.action !== "resolveRoom") return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const roomId = String(data.roomId || "");
      if (!roomId || this.state.mapStatus.get(roomId) === "cleared") return;

      const allowedRoles = Array.isArray(data.roles) ? data.roles : [data.roleKey];
      const canResolve = allowedRoles.includes("any") || allowedRoles.includes(player.roleKey);

      if (!canResolve) {
        client.send("serverMessage", `${data.title}은(는) ${data.roleLabel} 역할이 필요합니다.`);
        return;
      }

      if (Array.isArray(data.plates) && data.plates.length > 0 && !this.hasTeamOnPlates(player.group, data.plates)) {
        client.send("serverMessage", "팀원이 발판 위치를 함께 잡아야 장치가 열립니다.");
        return;
      }

      this.state.mapStatus.set(roomId, "cleared");
      this.state.itemsCollected += 1;
      if (typeof data.itemName === "string" && data.itemName.trim()) {
        player.inventory.push(data.itemName);
      }

      this.broadcast("roomCleared", {
        roomId,
        itemName: data.itemName,
        by: player.realName || player.job,
        total: this.state.itemsCollected,
      });

      if (this.state.itemsCollected >= 15) {
        this.broadcast("serverMessage", "15개의 아이템을 모두 확보했습니다. 보스 방으로 집결하세요!");
      }
    });

    this.onMessage("useSkill", (client) => {
      const caster = this.state.players.get(client.sessionId);
      if (!caster || caster.roleKey !== "specialist") return;

      let targetId: string | null = null;
      let minDistance = Infinity;
      this.state.players.forEach((player, sessionId) => {
        if (sessionId === client.sessionId || player.group !== caster.group) return;
        const distance = Math.hypot(caster.x - player.x, caster.y - player.y);
        if (distance < minDistance) {
          minDistance = distance;
          targetId = sessionId;
        }
      });

      if (!targetId || minDistance > 420) return;
      const target = this.state.players.get(targetId);
      if (!target) return;

      const tempX = caster.x;
      const tempY = caster.y;
      caster.x = target.x;
      caster.y = target.y;
      target.x = tempX;
      target.y = tempY;
      this.broadcast("skillUsed", { job: caster.job, name: caster.realName, skill: "위치 교환" });
    });

    this.onMessage("coordinatorTeleport", (client, data) => {
      const caster = this.state.players.get(client.sessionId);
      const target = this.state.players.get(String(data.targetSessionId || ""));
      if (!caster || caster.roleKey !== "specialist" || !target || target.group !== caster.group) return;
      target.x = clamp(Number(data.x) || target.x, 0, WORLD_BOUNDS.width);
      target.y = clamp(Number(data.y) || target.y, 0, WORLD_BOUNDS.height);
      this.broadcast("skillUsed", { job: caster.job, name: caster.realName, skill: `${target.realName} 지정 이동` });
    });

    this.onMessage("useAnalystSkill", (client) => {
      const caster = this.state.players.get(client.sessionId);
      if (!caster || caster.roleKey !== "analyst") return;
      this.broadcast("showHint", {
        message: "분석가 힌트: 방 설명의 핵심 역할과 발판 위치를 먼저 확인하세요. 보스는 약점 노출 아이템 후 공격하면 더 아픕니다.",
        sender: caster.realName,
      });
    });

    this.onMessage("useExplorerSkill", (client) => {
      const caster = this.state.players.get(client.sessionId);
      if (!caster || caster.roleKey !== "supporter") return;
      this.broadcast("skillUsed", { job: caster.job, name: caster.realName, skill: "개척 돌파" });
    });

    this.onMessage("useItem", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const index = Number(data.itemIndex);
      const itemName = player.inventory[index];
      if (!itemName) return;

      player.inventory.splice(index, 1);
      const effect = ITEM_EFFECTS[itemName] || { type: "attack", duration: 3000, multiplier: 1.5 };

      if (effect.type === "time") {
        this.state.timeRemaining += effect.seconds || 3;
        this.broadcast("serverMessage", `${player.realName}이(가) [${itemName}] 사용: 제한 시간이 늘어났습니다.`);
        return;
      }

      if (effect.type === "stun" || effect.type === "weak") {
        this.state.boss.status = effect.type;
        this.broadcast("serverMessage", `${player.realName}이(가) [${itemName}] 사용: 보스 상태가 ${effect.type === "stun" ? "기절" : "약점 노출"}로 바뀌었습니다.`);
        this.clock.setTimeout(() => {
          if (this.state.boss.hp > 0) this.state.boss.status = "idle";
        }, effect.duration || 3000);
        return;
      }

      client.send("applyBuff", {
        type: effect.type,
        itemName,
        duration: effect.duration || 3000,
        multiplier: effect.multiplier || 2,
      });
    });

    this.onMessage("attackBoss", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || this.state.boss.hp <= 0) return;
      const distance = Math.hypot(player.x - this.state.boss.x, player.y - this.state.boss.y);
      if (distance > 180) {
        client.send("serverMessage", "보스에게 더 가까이 다가가야 공격할 수 있습니다.");
        return;
      }

      let damage = 12 * (Number(data.attackPower) || 1);
      if (this.state.boss.status === "weak") damage *= 2;
      this.state.boss.hp = Math.max(0, this.state.boss.hp - Math.round(damage));
      this.broadcast("bossHit", { damage: Math.round(damage), by: player.realName, hp: this.state.boss.hp });

      if (this.state.boss.hp === 0) {
        this.state.boss.status = "defeated";
        this.broadcast("gameEnded", {
          result: "win",
          message: "하동환 교수를 물리치고 최동혁 조교를 구출했습니다!",
        });
      }
    });
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    player.character = options.character || "test_buddy1.png";
    player.job = options.job || "분석가";
    player.roleKey = options.roleKey || "analyst";
    player.group = String(options.group || "");
    player.realName = options.realName || "";
    player.x = 120 + Math.random() * 30;
    player.y = 120 + Math.random() * 30;
    player.vision = player.roleKey === "navigator" ? 330 : 155;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  private hasTeamOnPlates(group: string, plates: Array<{ x: number; y: number }>) {
    return plates.every((plate) => {
      let occupied = false;
      this.state.players.forEach((player) => {
        if (player.group === group && Math.hypot(player.x - plate.x, player.y - plate.y) < 70) {
          occupied = true;
        }
      });
      return occupied;
    });
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Concept Room game server is running.");
});

const gameServer = new Server({ server: httpServer });
gameServer.define("my_room", GameRoom).filterBy(["group"]);

const port = Number(process.env.PORT) || 2567;
gameServer.listen(port, "0.0.0.0");
