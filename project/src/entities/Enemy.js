export class Enemy {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.isBoss = options.isBoss || false;
    this.hp = options.hp || (this.isBoss ? 400 : 30);
    this.maxHp = this.hp;
    this.speed = options.speed || (this.isBoss ? 50 : 76); // 적 기본 속도 10% 하향 (일반 85->76, 보스 55->50)
    this.radius = options.radius || (this.isBoss ? 26 : 13);
    this.color = options.color || (this.isBoss ? 0xd946ef : 0xef4444);
    this.damage = options.damage || (this.isBoss ? 20 : 10);

    // 적 스프라이트(원형)
    this.sprite = scene.add.circle(x, y, this.radius, this.color);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(this.radius);
    this.sprite.enemyInstance = this;

    // 보스일 경우 체력바 그래픽 생성
    if (this.isBoss) {
      this.hpBar = scene.add.graphics();
      this.updateBossHpBar();
    }

    this.hitCooldown = 0;
  }

  get x() {
    return this.sprite ? this.sprite.x : 0;
  }

  get y() {
    return this.sprite ? this.sprite.y : 0;
  }

  updateBossHpBar() {
    if (!this.hpBar || !this.sprite) return;
    this.hpBar.clear();

    const barWidth = 60;
    const barHeight = 6;
    const bx = this.sprite.x - barWidth / 2;
    const by = this.sprite.y - this.radius - 12;

    // 배경
    this.hpBar.fillStyle(0x333333, 0.8);
    this.hpBar.fillRect(bx, by, barWidth, barHeight);

    // 게이지
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0xd946ef, 1);
    this.hpBar.fillRect(bx, by, barWidth * ratio, barHeight);
  }

  takeDamage(amount) {
    if (this.hitCooldown > 0 || !this.sprite) return false;

    this.hp -= amount;
    this.hitCooldown = 180; // 0.18초 무적

    // 피격 플래시 효과
    this.sprite.setFillStyle(0xffffff);
    this.scene.time.delayedCall(90, () => {
      if (this.sprite && this.sprite.active) {
        this.sprite.setFillStyle(this.color);
      }
    });

    if (this.isBoss) {
      this.updateBossHpBar();
    }

    if (this.hp <= 0) {
      this.destroy();
      return true; // 사망
    }

    return false;
  }

  update(playerX, playerY, delta) {
    if (!this.sprite || !this.sprite.active) return;

    if (this.hitCooldown > 0) {
      this.hitCooldown -= (delta || 16);
    }

    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      this.sprite.body.setVelocity((dx / dist) * this.speed, (dy / dist) * this.speed);
    }

    if (this.isBoss) {
      this.updateBossHpBar();
    }
  }

  stop() {
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
    }
  }

  destroy() {
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
