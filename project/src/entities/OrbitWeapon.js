export class OrbitWeapon {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.orbitRadius = 65; // 회전 반경
    this.rotationSpeed = 3.84; // 회전/공격 속도 20% 상향 (기존 3.2 -> 3.84 rad/s)
    this.currentAngle = 0;
    this.count = 1; // 무기 개수 (기본 1개)
    this.damage = 15;

    this.group = scene.physics.add.group();
    this.orbs = [];

    this.createOrbs();
  }

  createOrbs() {
    this.orbs.forEach(orb => orb.destroy());
    this.orbs = [];
    this.group.clear(true, true);

    for (let i = 0; i < this.count; i++) {
      const orb = this.scene.add.circle(0, 0, 9, 0xf59e0b); // 주황-황금색 구체
      this.scene.physics.add.existing(orb);
      orb.body.setCircle(9);
      orb.body.setImmovable(true);
      orb.body.moves = false;

      this.group.add(orb);
      this.orbs.push(orb);
    }
  }

  addOrb() {
    this.count += 1;
    this.createOrbs();
  }

  increaseSpeed(rate = 0.25) {
    this.rotationSpeed *= (1 + rate);
  }

  increaseDamage(amount = 5) {
    this.damage += amount;
  }

  update(delta) {
    if (!this.player || !this.player.sprite || !this.player.sprite.active) return;

    const dt = (delta || 16) / 1000;
    this.currentAngle += this.rotationSpeed * dt;

    const px = this.player.x;
    const py = this.player.y;
    const total = this.orbs.length;
    if (total === 0) return;

    const angleStep = (Math.PI * 2) / total;

    this.orbs.forEach((orb, index) => {
      const orbAngle = this.currentAngle + angleStep * index;
      const x = px + Math.cos(orbAngle) * this.orbitRadius;
      const y = py + Math.sin(orbAngle) * this.orbitRadius;

      orb.setPosition(x, y);
    });
  }
}
