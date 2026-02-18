#!/usr/bin/env python3
"""
Qwen3-TTS Python Wrapper
TypeScriptからの呼び出し用ラッパー
"""
import sys
import json
import torch
import numpy as np
import tempfile
import os
from pathlib import Path
from qwen_tts import Qwen3TTSModel

# 警告を無効化
import warnings
warnings.filterwarnings("ignore")


def generate_speech(text: str, speaker: str, language: str = "Japanese", instruct: str = None, output_path: str = None):
    """
    テキストから音声を生成
    
    Args:
        text: 話させるテキスト
        speaker: スピーカー名 (Vivian, Serena, Ryan など)
        language: 言語 ("Japanese", "English", "Auto" など)
        instruct: 声の指示（話し方の特徴を指定）
        output_path: 出力WAVファイルパス
    
    Returns:
        生成された音声ファイルのパス
    """
    try:
        # モデルのロード
        print(f"🔄 モデルをロード中...", file=sys.stderr)
        model = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
            device_map="cpu",
            dtype=torch.float32,
        )
        print(f"✅ モデルロード完了", file=sys.stderr)
        
        # 音声生成パラメータ
        generate_params = {
            "text": text,
            "language": language,
            "speaker": speaker,
        }
        if instruct:
            generate_params["instruct"] = instruct
        
        # 音声生成
        print(f"🎤 音声生成中: {text[:50]}...", file=sys.stderr)
        wavs, sr = model.generate_custom_voice(**generate_params)
        print(f"✅ 音声生成完了", file=sys.stderr)
        
        # ファイル保存（Windows対応、scipy使用）
        if output_path is None:
            fd, output_path = tempfile.mkstemp(suffix='.wav', prefix='qwen3_tts_')
            os.close(fd)
        
        # scipy.io.wavfile を使用（SoX不要）
        from scipy.io import wavfile
        # float32 → int16 に変換
        audio_int16 = np.int16(wavs[0] * 32767)
        wavfile.write(output_path, sr, audio_int16)
        print(f"💾 ファイル保存: {output_path}", file=sys.stderr)
        
        # パスを返す
        result = {
            "status": "success",
            "output_path": output_path,
            "sample_rate": int(sr),
            "duration_ms": int(len(wavs[0]) / sr * 1000)
        }
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "status": "error",
            "error": str(e)
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"status": "error", "error": "Usage: text speaker [language] [instruct] [output_path]"}), file=sys.stderr)
        sys.exit(1)
    
    text = sys.argv[1]
    speaker = sys.argv[2]
    language = sys.argv[3] if len(sys.argv) > 3 else "Japanese"
    instruct = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "none" else None
    output_path = sys.argv[5] if len(sys.argv) > 5 else None
    
    generate_speech(text, speaker, language, instruct, output_path)
