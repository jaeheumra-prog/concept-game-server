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

/*
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

// 플레이어 개별 상태
export class Player extends Schema {
    @type("number") x: number = 400;
    @type("number") y: number = 300;
    @type("string") job: string;
    @type("string") character: string;
    @type("string") group: string;
    @type("string") realName: string;

    // 💡 플레이어별 인벤토리
    @type(["string"]) inventory = new ArraySchema<string>();
}

// 전체 방 상태
export class MyRoomState extends Schema {
    @type("number") itemsCollected: number = 0;

    // 플레이어 목록
    @type({ map: Player }) players = new MapSchema<Player>();

    // 💡 맵 상태 기록 (아이템 "picked" 또는 장애물 "opened")
    @type({ map: "string" }) mapStatus = new MapSchema<string>();
}

/*
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number") x: number = 400;
    @type("number") y: number = 300;
    @type("string") job: string;
    @type("string") character: string;
    @type("string") group: string;
    @type("string") realName: string;
    @type(["string"]) inventory = new ArraySchema<string>();
}

// 🌟 최종 보스 스키마 추가
export class Boss extends Schema {
    @type("number") x: number = 400;
    @type("number") y: number = 150;
    @type("number") hp: number = 1000;
    @type("number") maxHp: number = 1000;
    @type("string") status: string = "idle"; // idle, stunned, weak
}

export class MyRoomState extends Schema {
    @type("number") itemsCollected: number = 0;
    @type("number") timeRemaining: number = 300; 

    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: "string" }) mapStatus = new MapSchema<string>();
    
    // 🌟 보스 객체 생성
    @type(Boss) boss = new Boss();
}

*/