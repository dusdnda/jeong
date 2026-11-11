export class GemManager {
  constructor(scene, player, onGemCollected) {
    this.scene = scene;
    this.player = player;
    this.onGemCollected = onGemCollected;

    this.group = scene.physics.add.group();
  }

  spawnGem(x, y, expValue = 10) {
    const gem = this.scene.add.circle(x, y, 6, 0x10b981); // 초록색 보석
    this.scene.physics.add.existing(gem);
    gem.body.setCircle(6);
    gem.body.setImmovable(true);
    gem.expValue = expValue;

    this.group.add(gem);
  }

  collectGem(gemSprite) {
    if (!gemSprite || !gemSprite.active) return;

    const expValue = gemSprite.expValue || 10;
    
    // 젬 습득 시 살짝 커졌다가 사라지는 트윈 연출
    this.scene.tweens.add({
      targets: gemSprite,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 120,
      onComplete: () => {
        if (gemSprite && gemSprite.active) {
          gemSprite.destroy();
        }
      }
    });

    if (this.onGemCollected) {
      this.onGemCollected(expValue);
    }
  }

  update() {
    // 향후 자석 스킬 또는 범위 습득 로직 확장 가능
  }
}
