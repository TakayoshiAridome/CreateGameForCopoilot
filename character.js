/**
 * キャラクタークラス
 * グラナド・エスパダ風のキャラクターシステムを実装
 */
class Character {
    constructor(name, characterClass) {
        this.name = name;
        this.class = characterClass;
        this.level = 1;
        this.experience = 0;
        this.nextLevelExp = 100;

        // ステータス初期化
        this.stats = this.initializeStats(characterClass);

        // スキル
        this.skills = this.initializeSkills(characterClass);

        // 装備
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        // 現在のHP
        this.currentHP = this.stats.maxHP;
    }

    /**
     * 職業別のステータスを初期化
     */
    initializeStats(characterClass) {
        const baseStats = {
            swordsman: {
                strength: 15,
                dexterity: 10,
                constitution: 14,
                intelligence: 8,
                wisdom: 10,
                maxHP: 100,
                maxMP: 30
            },
            musketeer: {
                strength: 12,
                dexterity: 16,
                constitution: 11,
                intelligence: 9,
                wisdom: 11,
                maxHP: 80,
                maxMP: 40
            },
            wizard: {
                strength: 7,
                dexterity: 10,
                constitution: 8,
                intelligence: 18,
                wisdom: 14,
                maxHP: 50,
                maxMP: 100
            },
            cleric: {
                strength: 10,
                dexterity: 11,
                constitution: 12,
                intelligence: 13,
                wisdom: 16,
                maxHP: 80,
                maxMP: 90
            }
        };

        return baseStats[characterClass] || baseStats.swordsman;
    }

    /**
     * 職業別のスキルを初期化
     */
    initializeSkills(characterClass) {
        const classSkills = {
            swordsman: [
                { id: 1, name: '斬撃', description: '基本的な剣技', cost: 10, damage: 50, cooldown: 0 },
                { id: 2, name: '強撃', description: '強力な一撃', cost: 25, damage: 100, cooldown: 3 },
                { id: 3, name: '二刀流', description: '両手で攻撃', cost: 30, damage: 150, cooldown: 5 }
            ],
            musketeer: [
                { id: 1, name: '銃撃', description: '基本的な射撃', cost: 10, damage: 45, cooldown: 0 },
                { id: 2, name: 'バレットシャワー', description: '複数の弾を発射', cost: 35, damage: 120, cooldown: 4 },
                { id: 3, name: '狙撃', description: '高い精度での射撃', cost: 30, damage: 180, cooldown: 6 }
            ],
            wizard: [
                { id: 1, name: 'ファイアボール', description: '炎の魔法', cost: 20, damage: 60, cooldown: 1 },
                { id: 2, name: 'フリーズ', description: '氷の魔法', cost: 25, damage: 70, cooldown: 2 },
                { id: 3, name: 'メテオ', description: '隕石魔法', cost: 50, damage: 200, cooldown: 8 }
            ],
            cleric: [
                { id: 1, name: 'ヒール', description: 'HP回復', cost: 20, damage: -50, cooldown: 1 },
                { id: 2, name: 'ホーリーライト', description: '聖なる光', cost: 30, damage: 80, cooldown: 2 },
                { id: 3, name: 'レザレクション', description: '蘇生', cost: 100, damage: 0, cooldown: 10 }
            ]
        };

        return classSkills[characterClass] || classSkills.swordsman;
    }

    /**
     * 経験値を獲得
     */
    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.nextLevelExp) {
            this.levelUp();
        }
    }

    /**
     * レベルアップ
     */
    levelUp() {
        this.level++;
        this.experience -= this.nextLevelExp;
        this.nextLevelExp = Math.floor(this.nextLevelExp * 1.1);

        // ステータスアップ
        const statBonuses = {
            swordsman: { strength: 2, constitution: 1.5, maxHP: 15 },
            musketeer: { dexterity: 2, strength: 1, maxHP: 12 },
            wizard: { intelligence: 2.5, wisdom: 1, maxMP: 20 },
            cleric: { wisdom: 2, intelligence: 1.5, maxMP: 18 }
        };

        const bonuses = statBonuses[this.class] || statBonuses.swordsman;
        for (let stat in bonuses) {
            if (this.stats[stat]) {
                this.stats[stat] += bonuses[stat];
            }
        }

        this.stats.maxHP = Math.floor(this.stats.maxHP * 1.1);
        this.stats.maxMP = Math.floor(this.stats.maxMP * 1.1);
        this.currentHP = this.stats.maxHP;
    }

    /**
     * ダメージを受ける
     */
    takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);
        return this.currentHP <= 0; // 死亡判定
    }

    /**
     * HP回復
     */
    heal(amount) {
        this.currentHP = Math.min(this.stats.maxHP, this.currentHP + amount);
    }

    /**
     * 装備を変更
     */
    equipItem(itemType, item) {
        this.equipment[itemType] = item;
    }

    /**
     * キャラクター情報をJSON形式で取得
     */
    toJSON() {
        return {
            name: this.name,
            class: this.class,
            level: this.level,
            experience: this.experience,
            nextLevelExp: this.nextLevelExp,
            stats: this.stats,
            currentHP: this.currentHP,
            skills: this.skills,
            equipment: this.equipment
        };
    }

    /**
     * キャラクター情報を文字列で取得
     */
    getInfo() {
        return `
[${this.name}]
職業: ${this.getClassJapanese()}
レベル: ${this.level}
経験値: ${this.experience}/${this.nextLevelExp}
HP: ${this.currentHP}/${this.stats.maxHP}

【ステータス】
力: ${Math.floor(this.stats.strength)}
敏捷性: ${Math.floor(this.stats.dexterity)}
耐久力: ${Math.floor(this.stats.constitution)}
知力: ${Math.floor(this.stats.intelligence)}
wisdom: ${Math.floor(this.stats.wisdom)}
        `;
    }

    /**
     * 職業を日本語で取得
     */
    getClassJapanese() {
        const classNames = {
            swordsman: '剣士',
            musketeer: '銃士',
            wizard: '魔法使い',
            cleric: '神官'
        };
        return classNames[this.class] || '未知';
    }
}

/**
 * 装備アイテムクラス
 */
class Equipment {
    constructor(name, type, stats, rarity = 'normal') {
        this.name = name;
        this.type = type; // weapon, armor, accessory
        this.stats = stats;
        this.rarity = rarity; // normal, rare, epic, legendary
    }

    getRarityColor() {
        const colors = {
            normal: '#ffffff',
            rare: '#0070dd',
            epic: '#a335ee',
            legendary: '#ff8000'
        };
        return colors[this.rarity] || '#ffffff';
    }
}

/**
 * アイテム管理クラス
 */
class ItemManager {
    constructor() {
        this.weapons = [
            new Equipment('鉄剣', 'weapon', { strength: 5 }, 'normal'),
            new Equipment('エクスカリバー', 'weapon', { strength: 20 }, 'legendary'),
            new Equipment('シルバーライフル', 'weapon', { dexterity: 15 }, 'rare')
        ];

        this.armors = [
            new Equipment('プレートアーマー', 'armor', { constitution: 8 }, 'normal'),
            new Equipment('ドラゴンスケイル', 'armor', { constitution: 25 }, 'epic')
        ];

        this.accessories = [
            new Equipment('力のリング', 'accessory', { strength: 3 }, 'rare'),
            new Equipment('敏捷のリング', 'accessory', { dexterity: 5 }, 'epic')
        ];
    }

    getWeapon(index) {
        return this.weapons[index];
    }

    getArmor(index) {
        return this.armors[index];
    }

    getAccessory(index) {
        return this.accessories[index];
    }
}
