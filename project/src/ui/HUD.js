export class HUD {
  constructor(scene) {
    this.scene = scene;
    const { width } = scene.scale;

    // 1. 경험치 게이지 바 (최상단, 폭 전체)
    this.expBg = scene.add.rectangle(width / 2, 8, width, 16, 0x1f2937).setDepth(10);
    this.expBar = scene.add.rectangle(0, 8, 0, 16, 0x38bdf8).setOrigin(0, 0.5).setDepth(10);
    this.levelText = scene.add.text(width / 2, 8, 'Lv.1 (0%)', {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // 2. 타이머 텍스트 (화면 상단 중앙)
    this.timerText = scene.add.text(width / 2, 34, '00:00', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // 3. 체력 게이지 바 (타이머 아래)
    const hpBarWidth = 140;
    const hpBarHeight = 12;
    this.hpBg = scene.add.rectangle(width / 2, 54, hpBarWidth, hpBarHeight, 0x374151).setDepth(10);
    this.hpBar = scene.add.rectangle(width / 2 - hpBarWidth / 2, 54, hpBarWidth, hpBarHeight, 0x22c55e).setOrigin(0, 0.5).setDepth(10);
    this.hpText = scene.add.text(width / 2, 54, 'HP 100/100', {
      fontFamily: 'sans-serif',
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // 4. 처치 수 표시 (우측 상단)
    this.killText = scene.add.text(width - 16, 34, '처치: 0', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#9ca3af'
    }).setOrigin(1, 0.5).setDepth(10);
  }

  update(player, elapsedTimeSeconds, killCount) {
    if (!player) return;

    // 1. 타이머 포맷 (MM:SS)
    const mins = Math.floor(elapsedTimeSeconds / 60);
    const secs = Math.floor(elapsedTimeSeconds % 60);
    this.timerText.setText(
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    );

    // 2. 체력 바 업데이트
    const hpBarWidth = 140;
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    this.hpBar.width = hpBarWidth * hpRatio;
    this.hpText.setText(`HP ${Math.ceil(player.hp)}/${player.maxHp}`);

    // 체력에 따른 색상 변화 (녹색 -> 주황 -> 빨강)
    if (hpRatio > 0.5) {
      this.hpBar.setFillStyle(0x22c55e);
    } else if (hpRatio > 0.25) {
      this.hpBar.setFillStyle(0xf59e0b);
    } else {
      this.hpBar.setFillStyle(0xef4444);
    }

    // 3. 경험치 바 업데이트
    const { width } = this.scene.scale;
    const expRatio = Math.min(1, player.exp / player.nextLevelExp);
    this.expBar.width = width * expRatio;
    const expPercent = Math.floor(expRatio * 100);
    this.levelText.setText(`Lv.${player.level} (${expPercent}%)`);

    // 4. 처치 수
    this.killText.setText(`처치: ${killCount}`);
  }
}
