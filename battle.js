/**
 * バトルシステムの核 - ターンベース戦闘ロジック
 */
class Battle {
    constructor(player, enemyData) {
        this.player = player;
        this.enemy = new Enemy(enemyData.name, enemyData.level, enemyData.type);
        
        this.currentTurn = 'player';
        this.gameOver = false;
        this.playerWon = false;
        this.battleLog = [];
        this.playerDefending = false;
        this.enemyDefending = false;

        this.addLog(`${this.player.name} vs ${this.enemy.name}`);
        this.addLog('バトル開始！');
    }

    /**
     * ログに追加
     */
    addLog(message) {
        this.battleLog.push(message);
    }

    /**
     * プレイヤーの通常攻撃
     */
    playerAttack() {
        if (this.currentTurn !== 'player') return;

        const damage = this.calculateDamage(this.player, this.enemy, this.enemyDefending);
        this.enemy.takeDamage(damage);
        this.addLog(`${this.player.name}の攻撃！${damage}ダメージ`);

        this.playerDefending = false;
        this.endPlayerTurn();
    }

    /**
     * プレイヤーがスキルを使用
     */
    playerUseSkill(skillId) {
        if (this.currentTurn !== 'player') return;

        const skill = this.player.skills.find(s => s.id === skillId);
        if (!skill) return;

        // マナチェック
        if (this.player.currentMana < skill.manaCost) {
            this.addLog('マナが不足しています！');
            return;
        }

        this.player.currentMana -= skill.manaCost;

        if (skill.name === 'ヒール') {
            this.player.heal(Math.abs(skill.damage));
            this.addLog(`${this.player.name}は${skill.name}を使用した！HP +${Math.abs(skill.damage)}`);
        } else {
            const damage = this.calculateSkillDamage(this.player, this.enemy, skill, this.enemyDefending);
            this.enemy.takeDamage(damage);
            this.addLog(`${this.player.name}は${skill.name}を使用した！${damage}ダメージ`);
        }

        this.playerDefending = false;
        this.endPlayerTurn();
    }

    /**
     * プレイヤーが防御
     */
    playerDefend() {
        if (this.currentTurn !== 'player') return;

        this.playerDefending = true;
        this.addLog(`${this.player.name}は防御の姿勢を取った！`);
        this.endPlayerTurn();
    }

    /**
     * プレイヤーがアイテムを使用
     */
    playerUseItem(itemName) {
        if (this.currentTurn !== 'player') return;

        if (itemName === '回復薬') {
            this.player.heal(50);
            this.addLog(`${this.player.name}は回復薬を使用した！HP +50`);
        }

        this.playerDefending = false;
        this.endPlayerTurn();
    }

    /**
     * プレイヤーが逃げる
     */
    playerFlee() {
        if (this.currentTurn !== 'player') return;

        // 敏捷性に基づいた逃走判定（50%の確率で成功）
        const fleeChance = Math.random() < 0.5;
        if (fleeChance) {
            this.addLog(`${this.player.name}は戦場から逃げた！`);
            this.gameOver = true;
            this.playerWon = false;
        } else {
            this.addLog('逃げられなかった！');
            this.endPlayerTurn();
        }
    }

    /**
     * プレイヤーのターン終了
     */
    endPlayerTurn() {
        this.currentTurn = 'enemy';

        // 敵がHP 0 以下なら戦闘終了
        if (this.enemy.currentHp <= 0) {
            this.gameOver = true;
            this.playerWon = true;
            this.addLog(`${this.enemy.name}を倒した！`);
        }
    }

    /**
     * 敵のターン
     */
    enemyTurn() {
        if (this.currentTurn !== 'enemy' || this.gameOver) return;

        // 敵がランダムにアクションを選択
        const action = Math.random();

        if (action < 0.6) {
            // 60%の確率で攻撃
            const damage = this.calculateDamage(this.enemy, this.player, this.playerDefending);
            this.player.takeDamage(damage);
            this.addLog(`${this.enemy.name}の攻撃！${damage}ダメージ`);
            this.enemyDefending = false;
        } else if (action < 0.8) {
            // 20%の確率で防御
            this.enemyDefending = true;
            this.addLog(`${this.enemy.name}は防御の姿勢を取った！`);
        } else {
            // 20%の確率でスキル
            const skill = this.enemy.skills[Math.floor(Math.random() * this.enemy.skills.length)];
            const damage = this.calculateSkillDamage(this.enemy, this.player, skill, this.playerDefending);
            this.player.takeDamage(damage);
            this.addLog(`${this.enemy.name}は${skill.name}を使用した！${damage}ダメージ`);
            this.enemyDefending = false;
        }

        // プレイヤーがHP 0 以下なら戦闘終了
        if (this.player.currentHp <= 0) {
            this.gameOver = true;
            this.playerWon = false;
            this.addLog(`${this.player.name}は倒れた...`);
        }

        this.currentTurn = 'player';
        this.playerDefending = false;
    }

    /**
     * 通常ダメージを計算
     */
    calculateDamage(attacker, defender, defendingFlag) {
        let baseDamage = attacker.stats.strength + Math.random() * 10;
        
        if (defendingFlag) {
            baseDamage *= 0.6; // 防御時は60%ダメージ
        }

        // 防御力による軽減
        const defense = defender.stats.constitution;
        const reducedDamage = Math.max(1, baseDamage - defense * 0.3);

        return Math.floor(reducedDamage);
    }

    /**
     * スキルダメージを計算
     */
    calculateSkillDamage(attacker, defender, skill, defendingFlag) {
        let damage = attacker.stats.intelligence * (skill.power / 100) + Math.random() * 15;

        if (defendingFlag) {
            damage *= 0.6;
        }

        // 魔法防御による軽減
        const mDefense = defender.stats.wisdom;
        const reducedDamage = Math.max(1, damage - mDefense * 0.2);

        return Math.floor(reducedDamage);
    }
}

/**
 * 敵クラス
 */
class Enemy {
    constructor(name, level, type) {
        this.name = name;
        this.level = level;
        this.type = type;
        
        this.stats = this.initializeStats(type, level);
        this.currentHp = this.stats.maxHP;
        this.skills = this.initializeSkills(type);
    }

    /**
     * 敵のステータスを初期化
     */
    initializeStats(type, level) {
        const baseStats = {
            goblin: {
                strength: 5 + level * 0.5,
                intelligence: 3,
                constitution: 4,
                wisdom: 2,
                maxHP: 30 + level * 5,
                maxMP: 10
            },
            orc: {
                strength: 10 + level * 0.8,
                intelligence: 5,
                constitution: 8,
                wisdom: 4,
                maxHP: 60 + level * 10,
                maxMP: 15
            },
            skeleton: {
                strength: 8 + level * 0.6,
                intelligence: 6,
                constitution: 7,
                wisdom: 5,
                maxHP: 50 + level * 8,
                maxMP: 20
            },
            mage: {
                strength: 5,
                intelligence: 12 + level * 1.2,
                constitution: 5,
                wisdom: 8,
                maxHP: 40 + level * 5,
                maxMP: 80 + level * 10
            },
            boss: {
                strength: 15 + level * 1.5,
                intelligence: 10 + level,
                constitution: 12 + level,
                wisdom: 10,
                maxHP: 150 + level * 20,
                maxMP: 50 + level * 5
            }
        };

        return baseStats[type] || baseStats.goblin;
    }

    /**
     * 敵のスキルを初期化
     */
    initializeSkills(type) {
        const skills = {
            goblin: [
                { id: 1, name: '斬撃', type: 'physical', power: 50, manaCost: 0 },
                { id: 2, name: '飛びかかり', type: 'physical', power: 60, manaCost: 5 }
            ],
            orc: [
                { id: 1, name: '大振り', type: 'physical', power: 80, manaCost: 10 },
                { id: 2, name: '地割れ', type: 'physical', power: 100, manaCost: 20 }
            ],
            skeleton: [
                { id: 1, name: '骨の矢', type: 'physical', power: 60, manaCost: 5 },
                { id: 2, name: '呪い', type: 'magic', power: 70, manaCost: 15 }
            ],
            mage: [
                { id: 1, name: 'ファイアボール', type: 'magic', power: 80, manaCost: 20 },
                { id: 2, name: 'フリーズ', type: 'magic', power: 90, manaCost: 25 }
            ],
            boss: [
                { id: 1, name: '絶望の一撃', type: 'physical', power: 120, manaCost: 30 },
                { id: 2, name: '魔力放出', type: 'magic', power: 150, manaCost: 50 },
                { id: 3, name: '究極技', type: 'physical', power: 200, manaCost: 80 }
            ]
        };

        return skills[type] || skills.goblin;
    }

    /**
     * ダメージを受ける
     */
    takeDamage(damage) {
        this.currentHp = Math.max(0, this.currentHp - damage);
        return this.currentHp <= 0;
    }
}
