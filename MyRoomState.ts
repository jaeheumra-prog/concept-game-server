import { Schema, type } from "@colyseus/schema";

// 플레이어 개별 상태
export class Player extends Schema {
    @type("number") x: number = 400;
    @type("number") y: number = 300;
    @type("string") job: string;
    @type("string") character: string;
    @type("string") group: string;
}

// 전체 방 상태
export class MyRoomState extends Schema {
    // 💡 아이템 획득 총합을 관리할 변수 추가
    @type("number") itemsCollected: number = 0; 
    
    // 플레이어 목록
    @type({ map: Player }) players = new Map<string, Player>();
}