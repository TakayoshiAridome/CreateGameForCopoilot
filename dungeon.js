/**
 * ダンジョンシステム - ダンジョン・フロア管理
 */
class Dungeon {
    constructor(name, level, difficulty, floors) {
        this.name = name;
        this.level = level;
        this.difficulty = difficulty;
        this.floors = floors;
        this.currentFloorIndex = 0;
        this.isClear = false;
    }

    /**
     * 次の敵データを取得
     */
    getNextEnemy() {
        const floor = this.floors[this.currentFloorIndex];
        return floor.getRandomEnemy();
    }

    /**
     * 次のフロアに進む
     */
    nextFloor() {
        this.currentFloorIndex++;
        if (this.currentFloorIndex >= this.floors.length) {
            this.isClear = true;
            return true; // ダンジョン完全クリア
        }
        return false; // 次のフロアへ
    }

    /**
     * 進度を取得
     */
    getProgress() {
        return {
            current: this.currentFloorIndex + 1,
            total: this.floors.length
        };
    }

    /**
     * ダンジョンをリセット
     */
    reset() {
        this.currentFloorIndex = 0;
    }
}

/**
 * フロアクラス
 */
class DungeonFloor {
    constructor(floorNumber, enemies) {
        this.floorNumber = floorNumber;
        this.enemies = enemies; // 敵の種類配列
    }

    /**
     * ランダムな敵を取得
     */
    getRandomEnemy() {
        return this.enemies[Math.floor(Math.random() * this.enemies.length)];
    }
}

/**
 * ダンジョンマネージャー
 */
class DungeonManager {
    constructor() {
        this.dungeons = this.initializeDungeons();
    }

    /**
     * ダンジョンを初期化
     */
    initializeDungeons() {
        return [
            new Dungeon(
                'ゴブリンの洞窟',
                1,
                'easy',
                [
                    new DungeonFloor(1, [
                        { name: 'ゴブリン', level: 1, type: 'goblin' },
                        { name: 'ゴブリン戦士', level: 2, type: 'goblin' }
                    ]),
                    new DungeonFloor(2, [
                        { name: 'ゴブリンボス', level: 3, type: 'boss' }
                    ])
                ]
            ),
            new Dungeon(
                'オークの森',
                5,
                'normal',
                [
                    new DungeonFloor(1, [
                        { name: 'オーク', level: 5, type: 'orc' },
                        { name: 'オーク戦士', level: 6, type: 'orc' }
                    ]),
                    new DungeonFloor(2, [
                        { name: 'オークキング', level: 8, type: 'boss' }
                    ])
                ]
            ),
            new Dungeon(
                '古い墓地',
                10,
                'hard',
                [
                    new DungeonFloor(1, [
                        { name: 'スケルトン', level: 10, type: 'skeleton' },
                        { name: 'スケルトン戦士', level: 11, type: 'skeleton' }
                    ]),
                    new DungeonFloor(2, [
                        { name: 'スケルトンロード', level: 13, type: 'boss' }
                    ])
                ]
            ),
            new Dungeon(
                '魔法師の塔',
                15,
                'hard',
                [
                    new DungeonFloor(1, [
                        { name: '魔法使い', level: 15, type: 'mage' },
                        { name: '上級魔法使い', level: 16, type: 'mage' }
                    ]),
                    new DungeonFloor(2, [
                        { name: '大魔法師', level: 18, type: 'boss' }
                    ])
                ]
            ),
            new Dungeon(
                '深き地底都市',
                20,
                'nightmare',
                [
                    new DungeonFloor(1, [
                        { name: 'アンデッド', level: 20, type: 'skeleton' },
                        { name: 'ダークナイト', level: 21, type: 'orc' }
                    ]),
                    new DungeonFloor(2, [
                        { name: 'ダーク魔法師', level: 23, type: 'mage' }
                    ]),
                    new DungeonFloor(3, [
                        { name: '深き地の王', level: 25, type: 'boss' }
                    ])
                ]
            ),
            new Dungeon(
                '究極のダンジョン',
                30,
                'nightmare',
                [
                    new DungeonFloor(1, [
                        { name: 'グレートオーク', level: 28, type: 'orc' },
                        { name: 'グレートスケルトン', level: 29, type: 'skeleton' }
                    ]),
                    new DungeonFloor(2, [
                        { name: 'アルティメットボス', level: 35, type: 'boss' }
                    ])
                ]
            )
        ];
    }

    /**
     * ダンジョンが進入可能かチェック
     */
    isClearable(playerLevel, dungeonIndex) {
        const dungeon = this.dungeons[dungeonIndex];
        if (!dungeon) return false;
        return playerLevel >= dungeon.level;
    }

    /**
     * ダンジョンに進入
     */
    enterDungeon(dungeonIndex) {
        const dungeon = this.dungeons[dungeonIndex];
        if (!dungeon) return null;
        dungeon.reset();
        return dungeon;
    }

    /**
     * ダンジョンをクリア
     */
    completeDungeon() {
        // クリア報酬処理
    }

    /**
     * すべてのダンジョンを取得
     */
    getDungeons() {
        return this.dungeons;
    }
}
