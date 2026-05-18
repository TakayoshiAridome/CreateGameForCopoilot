/**
 * ゲームメインロジック - グラナド・エスパダ風ゲーム
 */

let currentPlayer = null;
let dungeonManager = null;
let currentBattle = null;

/**
 * ゲーム初期化
 */
function initGame() {
  dungeonManager = new DungeonManager();
  battleUI = new BattleUI('battle-container');
  showScreen('main-screen');
}

/**
 * 新しいゲームを開始
 */
function startNewGame() {
  showScreen('character-creation-screen');
}

/**
 * 職業を選択
 */
function selectClass(className) {
  document.querySelectorAll('.class-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-class="${className}"]`).classList.add('selected');
  
  // ステータス表示を更新
  const stats = Character.getClassStats(className);
  const statsDiv = document.getElementById('class-stats');
  statsDiv.innerHTML = `
    <div class="stats-preview">
      <h4>ステータスプレビュー</h4>
      <p>⚔️ 力: ${stats.str}</p>
      <p>🎯 敏捷: ${stats.agi}</p>
      <p>🛡️ 耐久: ${stats.vit}</p>
      <p>📚 知力: ${stats.int}</p>
      <p>✨ 知恵: ${stats.wis}</p>
    </div>
  `;
}

/**
 * キャラクターを作成
 */
function createCharacter() {
  const name = document.getElementById('char-name').value || '冒険者';
  const selectedClass = document.querySelector('.class-btn.selected');
  
  if (!selectedClass) {
    alert('職業を選択してください！');
    return;
  }

  const className = selectedClass.dataset.class;
  currentPlayer = new Character(name, className);
  
  updatePlayerDisplay();
  showScreen('town-screen');
}

/**
 * プレイヤー情報表示を更新
 */
function updatePlayerDisplay() {
  document.getElementById('player-name-display').textContent = currentPlayer.name;
  document.getElementById('player-level').textContent = currentPlayer.level;
  document.getElementById('player-exp').textContent = currentPlayer.currentExp;
  document.getElementById('player-exp-next').textContent = currentPlayer.expToNextLevel;
  document.getElementById('player-gold').textContent = currentPlayer.gold;
  
  // HP/MP表示
  const hpPercent = (currentPlayer.currentHp / currentPlayer.stats.maxHp) * 100;
  const manaPercent = (currentPlayer.currentMana / currentPlayer.stats.maxMana) * 100;
  document.getElementById('player-hp-display').style.width = hpPercent + '%';
  document.getElementById('player-mana-display').style.width = manaPercent + '%';
  document.getElementById('player-hp-text').textContent = `${currentPlayer.currentHp}/${currentPlayer.stats.maxHp}`;
  document.getElementById('player-mana-text').textContent = `${currentPlayer.currentMana}/${currentPlayer.stats.maxMana}`;
  
  // ステータス表示
  document.getElementById('stat-str').textContent = currentPlayer.stats.str;
  document.getElementById('stat-agi').textContent = currentPlayer.stats.agi;
  document.getElementById('stat-vit').textContent = currentPlayer.stats.vit;
  document.getElementById('stat-int').textContent = currentPlayer.stats.int;
  document.getElementById('stat-wis').textContent = currentPlayer.stats.wis;
}

/**
 * ダンジョンリストを表示
 */
function showDungeonList() {
  const container = document.getElementById('dungeon-list-container');
  container.innerHTML = '';

  dungeonManager.getDungeons().forEach((dungeon, index) => {
    const isClearable = dungeonManager.isClearable(currentPlayer.level, index);
    const dungeonDiv = document.createElement('div');
    dungeonDiv.className = `dungeon-card ${isClearable ? 'clearable' : 'locked'}`;
    
    let difficulty = dungeon.difficulty;
    let difficultyColor = '';
    if (difficulty === 'easy') difficultyColor = '#00ff00';
    else if (difficulty === 'normal') difficultyColor = '#ffff00';
    else if (difficulty === 'hard') difficultyColor = '#ff6600';
    else if (difficulty === 'nightmare') difficultyColor = '#ff0000';

    dungeonDiv.innerHTML = `
      <h3>${dungeon.name}</h3>
      <p>推奨レベル: ${dungeon.level}</p>
      <p style="color: ${difficultyColor}; font-weight: bold;">難易度: ${difficulty}</p>
      <button onclick="enterDungeon(${index})" ${isClearable ? '' : 'disabled'} class="btn primary-btn">
        ${isClearable ? '進む' : 'ロック'}
      </button>
    `;
    
    container.appendChild(dungeonDiv);
  });

  showScreen('dungeon-list-screen');
}

/**
 * ダンジョンに進入
 */
function enterDungeon(dungeonIndex) {
  const dungeon = dungeonManager.enterDungeon(dungeonIndex);
  const enemyData = dungeon.getNextEnemy();
  
  if (enemyData) {
    const enemy = new Enemy(enemyData.name, enemyData.level, enemyData.type);
    
    // HP完全回復
    currentPlayer.currentHp = currentPlayer.stats.maxHp;
    currentPlayer.currentMana = currentPlayer.stats.maxMana;
    
    battleUI.initBattle(currentPlayer, enemy);
    battleUI.onBattleEnd = (playerWon) => {
      if (playerWon) {
        const progress = dungeon.getProgress();
        if (dungeon.nextFloor()) {
          // ダンジョン完全クリア
          dungeonManager.completeDungeon();
          alert(`🎉 ${dungeon.name}をクリアしました！\n追加の報酬を獲得しました！`);
          showDungeonList();
        } else {
          // 次のフロアへ
          alert(`次のフロアへ進みます... (${progress.current}/${progress.total})`);
          enterDungeon(dungeonIndex);
        }
      } else {
        // 敗北
        alert('敗北しました...\nタウンに戻ります。');
        currentPlayer.currentHp = currentPlayer.stats.maxHp;
        currentPlayer.currentMana = currentPlayer.stats.maxMana;
        updatePlayerDisplay();
        showDungeonList();
      }
    };

    showScreen('battle-screen');
  }
}

/**
 * 装備画面を表示
 */
function showEquipment() {
  const equipmentList = document.getElementById('equipment-list');
  const equipmentStats = document.getElementById('equipment-stats');
  
  equipmentList.innerHTML = `
    <h3>装備中</h3>
    <div class="equipment-slots">
      <div class="equipment-slot">
        <span>武器:</span>
        <span id="weapon-slot">${currentPlayer.equipment.weapon?.name || 'なし'}</span>
      </div>
      <div class="equipment-slot">
        <span>防具:</span>
        <span id="armor-slot">${currentPlayer.equipment.armor?.name || 'なし'}</span>
      </div>
      <div class="equipment-slot">
        <span>アクセサリ:</span>
        <span id="accessory-slot">${currentPlayer.equipment.accessory?.name || 'なし'}</span>
      </div>
    </div>
    
    <h3>所持品</h3>
    <div id="inventory-list" class="inventory-list"></div>
  `;

  if (currentPlayer.inventory && currentPlayer.inventory.length > 0) {
    const inventoryList = document.getElementById('inventory-list');
    currentPlayer.inventory.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'inventory-item';
      itemDiv.innerHTML = `
        <span>${item.rarity} ${item.name}</span>
        <button onclick="equipItem(${index})" class="btn small-btn">装備</button>
      `;
      inventoryList.appendChild(itemDiv);
    });
  }

  equipmentStats.innerHTML = `
    <h3>装備ボーナス</h3>
    <div class="stats-preview">
      <p>⚔️ 攻撃力: ${currentPlayer.stats.atk}</p>
      <p>🛡️ 防御力: ${currentPlayer.stats.def}</p>
      <p>📚 魔法攻撃: ${currentPlayer.stats.mAtk}</p>
      <p>✨ 魔法防御: ${currentPlayer.stats.mDef}</p>
    </div>
  `;

  showScreen('equipment-screen');
}

/**
 * アイテムを装備
 */
function equipItem(index) {
  if (currentPlayer.inventory && currentPlayer.inventory[index]) {
    const item = currentPlayer.inventory[index];
    currentPlayer.equipItem(item);
    showEquipment(); // 表示を更新
  }
}

/**
 * スキル画面を表示
 */
function showSkills() {
  const skillsList = document.getElementById('skills-list');
  skillsList.innerHTML = '<div class="skills-grid">';

  currentPlayer.skills.forEach((skill, index) => {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-card';
    skillDiv.innerHTML = `
      <h4>${skill.name}</h4>
      <p class="skill-type">${skill.type === 'magic' ? '✨ 魔法' : '⚡ 物理'}</p>
      <p>💙 マナコスト: ${skill.manaCost}</p>
      <p>⚡ 威力: ${skill.power}x</p>
      <p class="skill-description">${skill.description}</p>
    `;
    skillsList.appendChild(skillDiv);
  });

  skillsList.innerHTML += '</div>';
  showScreen('skills-screen');
}

/**
 * ゲームをセーブ
 */
function saveGame() {
  const saveData = {
    player: {
      name: currentPlayer.name,
      class: currentPlayer.class,
      level: currentPlayer.level,
      currentExp: currentPlayer.currentExp,
      gold: currentPlayer.gold,
      currentHp: currentPlayer.currentHp,
      currentMana: currentPlayer.currentMana
    },
    timestamp: new Date().toLocaleString()
  };

  localStorage.setItem('gameSave', JSON.stringify(saveData));
  alert('✅ ゲームをセーブしました！');
}

/**
 * ゲームを読み込む
 */
function showLoadGame() {
  const saveData = localStorage.getItem('gameSave');
  if (!saveData) {
    alert('セーブデータがありません');
    return;
  }

  const data = JSON.parse(saveData);
  currentPlayer = new Character(data.player.name, data.player.class);
  currentPlayer.level = data.player.level;
  currentPlayer.currentExp = data.player.currentExp;
  currentPlayer.gold = data.player.gold;
  currentPlayer.currentHp = data.player.currentHp;
  currentPlayer.currentMana = data.player.currentMana;

  updatePlayerDisplay();
  showScreen('town-screen');
}

/**
 * 画面表示切り替え
 */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

/**
 * タウンに戻る
 */
function backToTown() {
  updatePlayerDisplay();
  showScreen('town-screen');
}

/**
 * メインに戻る
 */
function backToMain() {
  showScreen('main-screen');
}

/**
 * ショップを表示（後で実装）
 */
function showShop() {
  alert('🛍️ ショップはまだ実装中です。');
}

/**
 * ゲーム開始
 */
window.addEventListener('DOMContentLoaded', () => {
  initGame();
});
