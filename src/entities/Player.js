export class Player {
  constructor(scene, x, y, onDie) {
    this.scene = scene;
    this.onDie = onDie;

    this.speed = 242; // 기본 이동 속도 10% 상향 (기존 220 -> 242)
    this.radius = 18;

    // 체력 및 레벨 관련
    this.maxHp = 100;
    this.hp = 100;
    this.level = 1;
    this.exp = 0;
    this.nextLevelExp = 30;

    // 피격 무적 시간
    this.invulnerableTime = 0;

    // 플레이어 캐릭터 본체 (하늘색 원형 도형)
    this.sprite = scene.add.circle(x, y, this.radius, 0x38bdf8);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(this.radius);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.playerInstance = this;

    // 키보드 입력 바인딩
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 마우스 / 터치 드래그 입력 처리
    this.isDragging = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    scene.input.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.length > 0) return;
      this.isDragging = true;
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    scene.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  get x() {
    return this.sprite ? this.sprite.x : 0;
  }

  get y() {
    return this.sprite ? this.sprite.y : 0;
  }

  takeDamage(amount) {
    if (this.scene.isPaused || this.invulnerableTime > 0 || this.hp <= 0) return;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTime = 600; // 0.6초 무적

    // 피격 시 카메라 흔들림 및 깜빡임 연출
    this.scene.cameras.main.shake(150, 0.008);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      yoyo: true,
      repeat: 3,
      duration: 75,
      onComplete: () => {
        if (this.sprite) this.sprite.setAlpha(1);
      }
    });

    if (this.hp <= 0 && this.onDie) {
      this.onDie();
    }
  }

  addExp(amount, onLevelUp) {
    this.exp += amount;
    while (this.exp >= this.nextLevelExp) {
      this.exp -= this.nextLevelExp;
      this.level += 1;
      this.nextLevelExp = Math.floor(this.nextLevelExp * 1.5);

      // 레벨업 시 체력 25% 회복
      this.hp = Math.min(this.maxHp, this.hp + 25);

      if (onLevelUp) {
        onLevelUp(this.level);
      }
    }
  }

  upgradeSpeed(rate = 0.15) {
    this.speed = Math.floor(this.speed * (1 + rate));
  }

  heal(amount = 30) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  update(delta) {
    if (!this.sprite || !this.sprite.active) return;

    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= (delta || 16);
    }

    let vx = 0;
    let vy = 0;

    // 1. 키보드 입력 검사
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx -= 1;
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx += 1;
    }
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy -= 1;
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy += 1;
    }

    // 2. 터치 / 마우스 드래그 검사
    if (vx === 0 && vy === 0 && this.isDragging) {
      const pointer = this.scene.input.activePointer;
      if (pointer.isDown) {
        const dx = pointer.x - this.touchStartX;
        const dy = pointer.y - this.touchStartY;
        const dist = Math.hypot(dx, dy);

        if (dist > 10) {
          vx = dx / dist;
          vy = dy / dist;
        }
      } else {
        this.isDragging = false;
      }
    } else if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    this.sprite.body.setVelocity(vx * this.speed, vy * this.speed);
  }

  stop() {
    this.isDragging = false;
    if (this.sprite && this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
