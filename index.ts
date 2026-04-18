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
  @type("string") job: string = "";
}

/**
 * 💡 게임 상태 관리
 */
class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  // 💡 아이템 수집 개수 관리 (기획안에 따라 층별 5개 수집 체크)
  @type("number") itemsCollected: number = 0;
}

/**
 * 💡 방 로직 (조별 분리 및 아이템 수집 포함)
 */
class GameRoom extends Room<GameState> {
  onCreate(options: any) { 
    this.maxClients = 5; // 기획안에 맞춰 최대 5인까지 허용 가능
    this.setState(new GameState()); 
    console.log(`✅ ${options.group}모둠 방 생성됨`); 

    // 1. 이동 로직
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

    // 2. 아이템 수집 로직
    this.onMessage("collectItem", (client) => {
      this.state.itemsCollected += 1;
      console.log(`[${options.group}모둠] 아이템 획득! 현재 수량: ${this.state.itemsCollected}/5`);

      // 층당 아이템 5개를 모두 모으면 모든 플레이어에게 맵 전환 신호 전송
      if (this.state.itemsCollected >= 5) {
        console.log(`[${options.group}모둠] 5개 수집 완료! 다음 맵으로 전환합니다.`);
        
        // 모든 클라이언트에게 changeMap 메시지 발송
        this.broadcast("changeMap", { 
          nextMap: "map_level_2", 
          message: "모든 아이템을 찾았습니다! 다음 층으로 이동합니다." 
        });

        // 다음 층을 위해 수집 개수 초기화
        this.state.itemsCollected = 0;
      }
    });
  }

  onJoin(client: Client, options: any) { 
    console.log(`🟢 입장: ${client.sessionId} (이름: ${options.realName}, 모둠: ${options.group})`); 
    
    const newPlayer = new Player();
    newPlayer.character = options.character || "test_buddy1";
    newPlayer.job = options.job || "분석자";
    
    this.state.players.set(client.sessionId, newPlayer);
  }

  onLeave(client: Client) { 
    console.log(`🔴 퇴장: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
  }
}

/**
 * 🚀 [Render 최적화] HTTP 서버 생성 및 Health Check
 */
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("서버 작동 중 - Team HIGH five");
});

const gameServer = new Server({
  server: httpServer
});

// 조별 방 분리 필터 (group별로 독립된 게임 공간 생성)
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