import { Player } from '../entities/Player.js';
import { OrbitWeapon } from '../entities/OrbitWeapon.js';
import { EnemyManager } from '../entities/EnemyManager.js';
import { GemManager } from '../entities/GemManager.js';
import { HUD } from '../ui/HUD.js';
import { LevelUpPopup } from '../ui/LevelUpPopup.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // 게임 진행 상태 변수 초기화
    this.isPaused = false;
    this.isGameOver = false;
    this.elapsedTime = 0; // 초 단위 누적 시간
    this.killCount = 0;
    this.pendingSkillPoints = 0;

    // 1. HUD 생성
    this.hud = new HUD(this);

    // 2. 플레이어 생성 (사망 시 게임오버 처리)
    const { width, height } = this.scale;
    this.player = new Player(this, width / 2, height / 2, () => this.handleGameOver());

    // 3. 궤도 공전 무기 생성
    this.orbitWeapon = new OrbitWeapon(this, this.player);

    // 4. 경험치 보석 관리자 생성
    this.gemManager = new GemManager(this, this.player, (exp) => {
      this.player.addExp(exp, (newLevel) => this.onPlayerLevelUp(newLevel));
    });

    // 5. 적 관리자 생성 (적 처치 / 보스 처치 콜백 연결)
    this.enemyManager = new EnemyManager(
      this,
      this.player,
      (x, y, isBoss) => {
        this.killCount += 1;
        this.gemManager.spawnGem(x, y, isBoss ? 50 : 10);
      },
      () => this.handleGameClear()
    );

    // 6. 레벨업 팝업 생성
    this.levelUpPopup = new LevelUpPopup(this, (skillId) => this.applySkill(skillId));

    // 7. 물리 충돌 (무기 <-> 적)
    this.physics.add.overlap(
      this.orbitWeapon.group,
      this.enemyManager.group,
      (orb, enemySprite) => {
        if (!this.isPaused && !this.isGameOver) {
          this.enemyManager.damageEnemy(enemySprite, this.orbitWeapon.damage);
        }
      }
    );

    // 8. 물리 충돌 (플레이어 <-> 적 : 접촉 피해)
    this.physics.add.overlap(
      this.player.sprite,
      this.enemyManager.group,
      (playerSprite, enemySprite) => {
        if (!this.isPaused && !this.isGameOver) {
          const enemy = enemySprite.enemyInstance;
          if (enemy) {
            this.player.takeDamage(enemy.damage);
          }
        }
      }
    );

    // 9. 물리 충돌 (플레이어 <-> 경험치 젬 : 습득)
    this.physics.add.overlap(
      this.player.sprite,
      this.gemManager.group,
      (playerSprite, gemSprite) => {
        if (!this.isPaused && !this.isGameOver) {
          this.gemManager.collectGem(gemSprite);
        }
      }
    );
  }

  onPlayerLevelUp(newLevel) {
    if (newLevel === 2) {
      // 1~3레벨 구간: 2레벨 달성 시 선택을 대기하고 포인트만 누적
      this.pendingSkillPoints = 1;
    } else if (newLevel === 3) {
      // 3레벨 달성 시 1~3레벨 총 3개의 능력치를 한 번에 선택할 수 있도록 3회 부여
      this.pendingSkillPoints = 3;
      this.startLevelUpSelection();
    } else if (newLevel > 3) {
      this.pendingSkillPoints = (this.pendingSkillPoints || 0) + 1;
      this.startLevelUpSelection();
    }
  }

  startLevelUpSelection() {
    if (this.isGameOver) return;
    this.isPaused = true;
    this.physics.pause(); // 물리 엔진 일시정지
    if (this.player) {
      this.player.stop(); // 플레이어 정지
    }
    if (this.enemyManager) {
      this.enemyManager.stopAll(); // 모든 적 개체 정지
    }
    this.levelUpPopup.show(this.player.level, this.pendingSkillPoints);
  }

  applySkill(skillId) {
    switch (skillId) {
      case 'add_orb':
        this.orbitWeapon.addOrb();
        break;
      case 'speed_up':
        this.orbitWeapon.increaseSpeed(0.25);
        break;
      case 'player_speed':
        this.player.upgradeSpeed(0.2);
        break;
      case 'heal':
        this.player.heal(40);
        break;
    }

    this.pendingSkillPoints -= 1;

    // 남은 선택 횟수가 있으면 다음 선택지 제시, 모두 소진 시 게임 재개
    if (this.pendingSkillPoints > 0) {
      this.time.delayedCall(100, () => {
        if (!this.isGameOver) {
          this.levelUpPopup.show(this.player.level, this.pendingSkillPoints);
        }
      });
    } else {
      this.physics.resume(); // 물리 엔진 재개
      if (this.player) {
        this.player.invulnerableTime = 600; // 선택 완료 후 0.6초 안전 무적 부여
      }
      this.isPaused = false;
    }
  }

  getFormattedTime() {
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const finalTime = this.getFormattedTime();
    const finalKills = this.killCount;

    this.time.delayedCall(700, () => {
      this.scene.start('ResultScene', {
        result: 'lose',
        survivalTime: finalTime,
        kills: finalKills
      });
    });
  }

  handleGameClear() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const finalTime = this.getFormattedTime();
    const finalKills = this.killCount;

    this.time.delayedCall(1000, () => {
      this.scene.start('ResultScene', {
        result: 'win',
        survivalTime: finalTime,
        kills: finalKills
      });
    });
  }

  update(time, delta) {
    if (this.isPaused || this.isGameOver) return;

    this.elapsedTime += (delta || 16) / 1000;

    if (this.player) {
      this.player.update(delta);
    }
    if (this.orbitWeapon) {
      this.orbitWeapon.update(delta);
    }
    if (this.enemyManager) {
      this.enemyManager.update(delta, this.elapsedTime);
    }
    if (this.gemManager) {
      this.gemManager.update();
    }
    if (this.hud) {
      this.hud.update(this.player, this.elapsedTime, this.killCount);
    }
  }
}
