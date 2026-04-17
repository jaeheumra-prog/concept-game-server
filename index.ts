import { Server, Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import http from "http";

/**
 * 💡 플레이어 데이터 구조
 */
class Player extends Schema {
  @type("number") x: number = 400; 
  @type("number") y: number = 300; 
  @type("string") character: string = "";
}

/**
 * 💡 게임 상태 관리
 */
class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}

/**
 * 💡 방 로직 (조별 분리 포함)
 */
class GameRoom extends Room<GameState> {
  onCreate(options: any) { 
    this.maxClients = 4; 
    this.setState(new GameState()); 
    console.log(`✅ ${options.group}모둠 방 생성됨`); 

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
  }

  onJoin(client: Client, options: any) { 
    console.log(`🟢 입장: ${client.sessionId} (모둠: ${options.group})`); 
    const newPlayer = new Player();
    newPlayer.character = options.character || "slime_green";
    this.state.players.set(client.sessionId, newPlayer);
  }

  onLeave(client: Client) { 
    this.state.players.delete(client.sessionId);
  }
}

/**
 * 🚀 [Render 최적화] HTTP 서버 생성 및 Health Check
 */
const httpServer = http.createServer((req, res) => {
  // Render가 서버 살아있는지 확인할 때 대답해주는 로직
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("서버 작동 중 - Team HIGH five");
});

const gameServer = new Server({
  server: httpServer
});

// 조별 방 분리 필터
gameServer.define('my_room', GameRoom).filterBy(['group']);

/**
 * 🚀 포트 설정 및 서버 시작
 */
const port = Number(process.env.PORT) || 2567;

gameServer.listen(port, "0.0.0.0").then(() => {
  console.log(`✅ 서버가 성공적으로 열렸습니다: 포트 ${port}`);
}).catch((err) => {
  console.error("❌ 서버 시작 에러:", err);
});