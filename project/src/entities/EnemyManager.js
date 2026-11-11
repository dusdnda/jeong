import { Enemy } from './Enemy.js';

export class EnemyManager {
  constructor(scene, player, onEnemyKilled, onBossKilled) {
    this.scene = scene;
    this.player = player;
    this.onEnemyKilled = onEnemyKilled;
    this.onBossKilled = onBossKilled;

    this.enemies = [];
    this.group = scene.physics.add.group();

    this.spawnTimer = 0;
    this.spawnInterval = 1200; // 초기 스폰 간격 (1.2초)
    this.elapsedGameTime = 0; // 초 단위

    this.bossSpawned = false;
    this.bossDefeated = false;
  }

  getRandomSpawnPos() {
    const { width, height } = this.scene.scale;
    const margin = 40;
    let x, y;

    const side = Phaser.Math.Between(0, 3);
    switch (side) {
      case 0:
        x = Phaser.Math.Between(0, width);
        y = -margin;
        break;
      case 1:
        x = Phaser.Math.Between(0, width);
        y = height + margin;
        break;
      case 2:
        x = -margin;
        y = Phaser.Math.Between(0, height);
        break;
      case 3:
        x = width + margin;
        y = Phaser.Math.Between(0, height);
        break;
    }
    return { x, y };
  }

  spawnEnemy() {
    const { x, y } = this.getRandomSpawnPos();

    // 시간에 따른 적 스펙 점진 증가 (기본 속도 10% 하향 적용)
    let hp = 30;
    let speed = 76;
    if (this.elapsedGameTime >= 30) {
      hp = 45;
      speed = 85;
    }

    const enemy = new Enemy(this.scene, x, y, { hp, speed });
    this.enemies.push(enemy);
    this.group.add(enemy.sprite);
  }

  spawnBoss() {
    this.bossSpawned = true;
    const { width } = this.scene.scale;

    // 경고 텍스트 연출
    const warning = this.scene.add.text(width / 2, 200, '⚠️ 보스 몬스터 등장! ⚠️', {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: warning,
      alpha: 0,
      yoyo: true,
      repeat: 3,
      duration: 300,
      onComplete: () => warning.destroy()
    });

    // 화면 상단 밖에서 보스 스폰
    const boss = new Enemy(this.scene, width / 2, -60, { isBoss: true });
    this.enemies.push(boss);
    this.group.add(boss.sprite);
  }

  damageEnemy(enemySprite, amount) {
    const enemy = enemySprite.enemyInstance;
    if (!enemy) return;

    const deathX = enemy.x;
    const deathY = enemy.y;
    const isBoss = enemy.isBoss;

    const isKilled = enemy.takeDamage(amount);
    if (isKilled) {
      this.enemies = this.enemies.filter(e => e !== enemy);
      this.group.remove(enemySprite, true, true);

      if (this.onEnemyKilled) {
        this.onEnemyKilled(deathX, deathY, isBoss);
      }

      if (isBoss && !this.bossDefeated) {
        this.bossDefeated = true;
        if (this.onBossKilled) {
          this.onBossKilled();
        }
      }
    }
  }

  stopAll() {
    this.enemies.forEach(enemy => {
      enemy.stop();
    });
  }

  update(delta, totalElapsedTime) {
    this.elapsedGameTime = totalElapsedTime || 0;

    // 60초 도달 시 보스 출현
    if (this.elapsedGameTime >= 60 && !this.bossSpawned) {
      this.spawnBoss();
    }

    // 시간에 따라 스폰 간격 단축
    if (this.elapsedGameTime >= 30) {
      this.spawnInterval = 750;
    } else {
      this.spawnInterval = 1200;
    }

    this.spawnTimer += (delta || 16);
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    const px = this.player.x;
    const py = this.player.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.sprite || !enemy.sprite.active) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(px, py, delta);
    }
  }
}
