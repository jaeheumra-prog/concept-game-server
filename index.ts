import { Server, Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import http from "http";

class Player extends Schema {
  @type("number") x: number = 400; 
  @type("number") y: number = 300; 
  @type("string") character: string = "";
}

class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}

class GameRoom extends Room<GameState> {
  onCreate(options: any) { 
    this.maxClients = 4; // 한 조에 4명씩
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

const gameServer = new Server({ server: http.createServer() });

// 💡 filterBy(['group'])가 핵심입니다. 이 설정 덕분에 조별로 방이 나뉩니다.
gameServer.define('my_room', GameRoom).filterBy(['group']);

gameServer.listen(2567);
console.log("🚀 서버 대기 중: ws://localhost:2567");