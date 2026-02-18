import { BotManager } from './bots/BotManager.js';
import cron from 'node-cron';

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

    // 起動時に会話を開始
    console.log('\n🤖 起動後すぐに自律会話を開始します...');
    try {
      await manager.startAutonomousConversation();
    } catch (error) {
      console.error('❌ 自律会話の開始中にエラーが発生しました:', error);
    }

    // 毎日10時に会話を開始するスケジュール
    cron.schedule('0 10 * * *', async () => {
      console.log('\n⏰ 朝10時になりました。自律会話を開始します...');
      if (!manager.isConversationRunning()) {
        try {
          await manager.startAutonomousConversation();
        } catch (error) {
          console.error('❌ 自律会話の開始中にエラーが発生しました:', error);
        }
      } else {
        console.log('⚠️ 会話は既に進行中です');
      }
    }, {
      timezone: 'Asia/Tokyo'
    });

    // 毎日18時に会話を終了してレポートを生成するスケジュール
    cron.schedule('0 18 * * *', async () => {
      console.log('\n⏰ 18時になりました。会話を終了してレポートを生成します...');
      try {
        await manager.endConversationAndGenerateReport();
      } catch (error) {
        console.error('❌ レポート生成中にエラーが発生しました:', error);
      }
    }, {
      timezone: 'Asia/Tokyo'
    });

    console.log('\n✅ スケジューリングを設定しました');
    console.log('   📅 毎日10時: 会話開始');
    console.log('   📅 毎日18時: 会話終了・レポート生成');
    console.log('💡 Ctrl+C で終了できます\n');

    // プログラムを終了させずに実行し続ける
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await manager.shutdown();
    process.exit(1);
  }
}

// 実行
main().catch(console.error);
