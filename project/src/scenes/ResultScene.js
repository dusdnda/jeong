export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.result = data.result || 'lose'; // 'win' or 'lose'
    this.survivalTime = data.survivalTime || '00:00';
    this.kills = data.kills !== undefined ? data.kills : 0;
  }

  create() {
    const { width, height } = this.scale;
    const isWin = this.result === 'win';

    // 1. 결과 제목
    this.add.text(width / 2, height * 0.26, isWin ? '생존 성공! (클리어)' : '게임 오버', {
      fontFamily: 'sans-serif',
      fontSize: '34px',
      color: isWin ? '#22c55e' : '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 2. 결과 기록 박스
    const box = this.add.rectangle(width / 2, height * 0.42, 280, 110, 0x1f2937, 0.8)
      .setStrokeStyle(1, 0x374151);

    this.add.text(width / 2, height * 0.38, `⏱️ 생존 시간: ${this.survivalTime}`, {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, `⚔️ 처치한 적: ${this.kills} 마리`, {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#60a5fa'
    }).setOrigin(0.5);

    // 3. '다시 하기' 버튼
    const restartBtn = this.add.rectangle(width / 2, height * 0.58, 220, 50, 0x10b981)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.58, '다시 하기', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x059669));
    restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x10b981));
    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 4. '시작 화면으로' 버튼
    const titleBtn = this.add.rectangle(width / 2, height * 0.68, 220, 48, 0x4b5563)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.68, '시작 화면으로', {
      fontFamily: 'sans-serif',
      fontSize: '17px',
      color: '#ffffff'
    }).setOrigin(0.5);

    titleBtn.on('pointerover', () => titleBtn.setFillStyle(0x374151));
    titleBtn.on('pointerout', () => titleBtn.setFillStyle(0x4b5563));
    titleBtn.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
  }
}
