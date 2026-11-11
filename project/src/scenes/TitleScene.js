export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 제목
    this.add.text(width / 2, height * 0.3, '탕탕 수호대', {
      fontFamily: 'sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 설명 문구
    this.add.text(width / 2, height * 0.42, '몰려오는 적을 무찌르고 살아남으세요!\n조작: 방향키 / WASD / 드래그 이동\n공격: 자동 궤도 회전 공격', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // 게임 시작 버튼 배경 및 텍스트
    const startBtn = this.add.rectangle(width / 2, height * 0.6, 200, 50, 0x3b82f6)
      .setInteractive({ useHandCursor: true });

    const startText = this.add.text(width / 2, height * 0.6, '게임 시작', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x2563eb));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x3b82f6));
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
