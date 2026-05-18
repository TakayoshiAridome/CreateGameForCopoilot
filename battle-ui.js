/**
 * バトルUI - 画面表示・ユーザーインタラクション
 */
class BattleUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.battle = null;
        this.onBattleEnd = null;
        this.animationDelay = 1500; // ms
    }

    /**
     * バトルを初期化
     */
    initBattle(player, enemy) {
        this.battle = new Battle(player, enemy);
        this.updateDisplay();
    }

    /**
     * 画面を更新
     */
    updateDisplay() {
        if (!this.battle) return;

        // プレイヤー情報
        document.getElementById('player-battle-name').textContent = this.battle.player.name;
        const playerHpPercent = (this.battle.player.currentHp / this.battle.player.stats.maxHP) * 100;
        const playerMpPercent = (this.battle.player.currentMana / this.battle.player.stats.maxMana) * 100;
        document.getElementById('player-battle-hp').style.width = playerHpPercent + '%';
        document.getElementById('player-battle-mp').style.width = playerMpPercent + '%';

        // 敵情報
        document.getElementById('enemy-battle-name').textContent = this.battle.enemy.name;
        const enemyHpPercent = (this.battle.enemy.currentHp / this.battle.enemy.stats.maxHP) * 100;
        document.getElementById('enemy-battle-hp').style.width = enemyHpPercent + '%';

        // ログ更新
        this.updateLog();

        // ボタン制御
        this.updateButtons();
    }

    /**
     * ログを更新
     */
    updateLog() {
        const logContent = document.getElementById('battle-log-content');
        logContent.innerHTML = '';
        
        this.battle.battleLog.slice(-10).forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.textContent = log;
            logContent.appendChild(entry);
        });

        logContent.parentElement.scrollTop = logContent.parentElement.scrollHeight;
    }

    /**
     * ボタン制御を更新
     */
    updateButtons() {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach((btn, index) => {
            btn.disabled = this.battle.currentTurn !== 'player' || this.battle.gameOver;
        });
    }

    /**
     * アクションを実行
     */
    executeAction(action) {
        if (this.battle.gameOver) return;

        switch (action) {
            case 'attack':
                this.battle.playerAttack();
                break;
            case 'defend':
                this.battle.playerDefend();
                break;
            case 'flee':
                this.battle.playerFlee();
                break;
        }

        this.updateDisplay();

        if (!this.battle.gameOver && this.battle.currentTurn === 'enemy') {
            setTimeout(() => this.executeEnemyTurn(), this.animationDelay);
        } else if (this.battle.gameOver) {
            setTimeout(() => this.showBattleResult(), this.animationDelay);
        }
    }

    /**
     * 敵のターンを実行
     */
    executeEnemyTurn() {
        this.battle.enemyTurn();
        this.updateDisplay();

        if (this.battle.gameOver) {
            setTimeout(() => this.showBattleResult(), this.animationDelay);
        }
    }

    /**
     * バトル結果を表示
     */
    showBattleResult() {
        const resultOverlay = document.getElementById('battle-result-overlay');
        const resultTitle = document.getElementById('result-title');
        const resultExp = document.getElementById('result-exp');
        const resultGold = document.getElementById('result-gold');

        if (this.battle.playerWon) {
            resultTitle.textContent = '🎉 勝利！';
            resultTitle.style.color = '#00ff00';
            const expGained = Math.floor(this.battle.enemy.level * 50);
            const goldGained = Math.floor(this.battle.enemy.level * 20);
            resultExp.textContent = `${expGained}の経験値を獲得！`;
            resultGold.textContent = `${goldGained}ゴールドを獲得！`;
        } else {
            resultTitle.textContent = '💀 敗北...';
            resultTitle.style.color = '#ff0000';
            resultExp.textContent = '敵には勝てなかった...';
            resultGold.textContent = 'タウンに戻ります';
        }

        resultOverlay.classList.remove('hidden');
    }
}

/**
 * スキルメニューを表示
 */
function showSkillMenu() {
    if (!currentPlayer || currentPlayer.skills.length === 0) return;

    const skillMenuList = document.getElementById('skill-menu-list');
    skillMenuList.innerHTML = '';

    currentPlayer.skills.forEach((skill) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <span class="skill-name">${skill.name}</span>
            <span class="skill-cost">💙 ${skill.manaCost}</span>
            <span class="skill-power">⚡ ${skill.power}x</span>
            <button class="btn small-btn" onclick="useSkillInBattle(${skill.id})">使用</button>
        `;
        skillMenuList.appendChild(menuItem);
    });

    document.getElementById('skill-menu-overlay').classList.remove('hidden');
}

/**
 * スキルメニューを閉じる
 */
function closeSkillMenu() {
    document.getElementById('skill-menu-overlay').classList.add('hidden');
}

/**
 * バトル中にスキルを使用
 */
function useSkillInBattle(skillId) {
    if (battleUI && battleUI.battle) {
        battleUI.battle.playerUseSkill(skillId);
        closeSkillMenu();
        battleUI.updateDisplay();

        if (!battleUI.battle.gameOver && battleUI.battle.currentTurn === 'enemy') {
            setTimeout(() => battleUI.executeEnemyTurn(), battleUI.animationDelay);
        } else if (battleUI.battle.gameOver) {
            setTimeout(() => battleUI.showBattleResult(), battleUI.animationDelay);
        }
    }
}

/**
 * アイテムメニューを表示
 */
function showItemMenu() {
    const itemMenuList = document.getElementById('item-menu-list');
    itemMenuList.innerHTML = `
        <div class="menu-item" onclick="useItemInBattle('回復薬')">
            <span class="skill-name">🧪 回復薬</span>
            <span class="skill-power">+50 HP</span>
            <button class="btn small-btn" onclick="event.stopPropagation(); useItemInBattle('回復薬')">使用</button>
        </div>
    `;
    document.getElementById('item-menu-overlay').classList.remove('hidden');
}

/**
 * アイテムメニューを閉じる
 */
function closeItemMenu() {
    document.getElementById('item-menu-overlay').classList.add('hidden');
}

/**
 * バトル中にアイテムを使用
 */
function useItemInBattle(itemName) {
    if (battleUI && battleUI.battle) {
        battleUI.battle.playerUseItem(itemName);
        closeItemMenu();
        battleUI.updateDisplay();

        if (!battleUI.battle.gameOver && battleUI.battle.currentTurn === 'enemy') {
            setTimeout(() => battleUI.executeEnemyTurn(), battleUI.animationDelay);
        }
    }
}

/**
 * バトル結果を閉じる
 */
function closeBattleResult() {
    document.getElementById('battle-result-overlay').classList.add('hidden');
    
    if (battleUI && battleUI.onBattleEnd) {
        battleUI.onBattleEnd(battleUI.battle.playerWon);
    }
}

// グローバル変数
let battleUI = null;
