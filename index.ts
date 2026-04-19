import { Server, Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import http from "http";

class Player extends Schema {
  @type("number") x: number = 400; 
  @type("number") y: number = 300; 
  @type("string") character: string = "";
  @type("string") job: string = "";
  @type("string") group: string = "";
  @type("string") realName: string = "";
  @type("number") vision: number = 150; 
}

class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") itemsCollected: number = 0;
}

class GameRoom extends Room<GameState> {
  onCreate(options: any) { 
    this.setState(new GameState()); 

    // 이동 처리 (클라이언트 물리엔진 좌표 연동)
    this.onMessage("movePos", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
         player.x = data.x;
         player.y = data.y;
      }
    });

    // 기존 이동 처리 로직 (호환성을 위해 남겨둠)
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        const speed = 7;
        if (data.dir === "left") player.x -= speed;
        if (data.dir === "right") player.x += speed;
        if (data.dir === "up") player.y -= speed;
        if (data.dir === "down") player.y += speed;
      }
    });

    // 💡 조율자 스킬 처리 (위치 바꾸기)
    this.onMessage("useSkill", (client) => {
      const caster = this.state.players.get(client.sessionId);
      
      // 조율자(test_buddy4)만 사용 가능 여부 서버에서 재확인
      if (!caster || caster.character !== "test_buddy4") return;

      let targetId: string | null = null;
      let minDistance = Infinity;

      // 자신을 제외한 가장 가까운 플레이어 찾기
      this.state.players.forEach((player, sessionId) => {
        if (sessionId !== client.sessionId) {
          const dist = Math.sqrt(Math.pow(caster.x - player.x, 2) + Math.pow(caster.y - player.y, 2));
          if (dist < minDistance) {
            minDistance = dist;
            targetId = sessionId;
          }
        }
      });

      // 반경 400px 이내에 팀원이 있다면 위치 스왑
      if (targetId && minDistance < 400) {
        const target = this.state.players.get(targetId);
        
        const tempX = caster.x;
        const tempY = caster.y;
        
        if(target){
        caster.x = target.x;
        caster.y = target.y;
        
        target.x = tempX;
        target.y = tempY;

        }

        console.log(`[Skill] ${client.sessionId} swapped with ${targetId}`);
      }
    });

    this.onMessage("collectItem", (client) => {
      this.state.itemsCollected += 1;
      if (this.state.itemsCollected >= 5) {
        this.broadcast("changeMap", { nextMap: "map_level_2", message: "다음 층으로 이동!" });
        this.state.itemsCollected = 0;
      }
    });
  }

  onJoin(client: Client, options: any) { 
    const newPlayer = new Player();
    newPlayer.character = options.character || "test_buddy1";
    newPlayer.job = options.job || "분석자";
    newPlayer.group = options.group || "";
    newPlayer.realName = options.realName || "";
    newPlayer.vision = (newPlayer.character === "test_buddy3") ? 350 : 150;
    this.state.players.set(client.sessionId, newPlayer);
  }

  onLeave(client: Client) { this.state.players.delete(client.sessionId); }
}

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("서버 작동 중");
});

const gameServer = new Server({ server: httpServer });
gameServer.define('my_room', GameRoom).filterBy(['group']);

const port = Number(process.env.PORT) || 2567;
gameServer.listen(port, "0.0.0.0");