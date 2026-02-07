import { BotManager } from './bots/BotManager.js';

/**
 * メイン処理
 */
async function main() {
  console.log('='.repeat(50));
  console.log('🐰 おしゃべりうさこ部 Discord Bot');
  console.log('='.repeat(50));

  const manager = new BotManager();

  // シグナルハンドリング（Ctrl+Cなどでの終了処理）
  process.on('SIGINT', async () => {
    console.log('\n⚠️ 終了シグナルを受信しました');
    await manager.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⚠️ 終了シグナルを受信しました');
    await manager.shutdown();
    process.exit(0);
  });

  try {
    // Bot初期化
    await manager.initialize();

    // テストメッセージ送信
    console.log('\n📨 5秒後にテストメッセージを送信します...');
    await sleep(5000);
    await manager.sendTestMessages();

    console.log('\n✅ Bot起動完了！');
    console.log('💡 Ctrl+C で終了できます\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await manager.shutdown();
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 実行
main().catch(console.error);
