#!/usr/bin/env python3
"""
Transcribe Apple Voice Memo audio files with OpenAI Whisper.

Supports a single file or a directory of files. Apple Voice Memos are commonly
stored as .m4a, but Whisper can also handle other common audio/video formats.

Examples:
    python3 transcribe_voice_memos.py recording.m4a
    python3 transcribe_voice_memos.py ./voice-memos --model base
    python3 transcribe_voice_memos.py ./voice-memos --output-dir ./transcripts

Install:
    pip install openai-whisper

Requirements:
    - Python 3.9+
    - ffmpeg installed and available on PATH
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path
from typing import Iterable


SUPPORTED_EXTENSIONS = {
    ".m4a",
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".wav",
    ".webm",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe Apple Voice Memo audio files with Whisper."
    )
    parser.add_argument(
        "input_path",
        type=Path,
        help="Path to an audio file or a directory containing audio files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Directory for transcript files. Defaults to the audio file's folder.",
    )
    parser.add_argument(
        "--model",
        default="base",
        help="Whisper model name, e.g. tiny, base, small, medium, large.",
    )
    parser.add_argument(
        "--language",
        default=None,
        help="Optional spoken language code, e.g. en, es, fr.",
    )
    parser.add_argument(
        "--device",
        default=None,
        help="Optional device override, e.g. cpu or cuda.",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Recursively search for supported audio files inside directories.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files whose .txt transcript already exists.",
    )
    parser.add_argument(
        "--save-json",
        action="store_true",
        help="Also save the full Whisper result as JSON.",
    )
    return parser.parse_args()


def ensure_ffmpeg() -> None:
    if shutil.which("ffmpeg"):
        return
    try:
        import imageio_ffmpeg

        ffmpeg_path = Path(imageio_ffmpeg.get_ffmpeg_exe())
        if ffmpeg_path.exists():
            shim_dir = Path.cwd() / ".local-bin"
            shim_dir.mkdir(exist_ok=True)
            shim_path = shim_dir / "ffmpeg"
            shim_path.write_text(
                f"#!/bin/sh\nexec '{ffmpeg_path}' \"$@\"\n",
                encoding="utf-8",
            )
            shim_path.chmod(0o755)
            os.environ["PATH"] = f"{shim_dir}{os.pathsep}{os.environ.get('PATH', '')}"
            return
    except Exception:
        pass
    print(
        "Error: ffmpeg is not installed or not available on PATH.\n"
        "Install ffmpeg first, or install imageio-ffmpeg, then run the script again.",
        file=sys.stderr,
    )
    raise SystemExit(1)


def load_whisper():
    try:
        import whisper
    except ImportError:
        print(
            "Error: openai-whisper is not installed.\n"
            "Install it with: pip install openai-whisper",
            file=sys.stderr,
        )
        raise SystemExit(1)
    return whisper


def collect_audio_files(input_path: Path, recursive: bool) -> list[Path]:
    if not input_path.exists():
        print(f"Error: path does not exist: {input_path}", file=sys.stderr)
        raise SystemExit(1)

    if input_path.is_file():
        if input_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            print(
                f"Error: unsupported file type: {input_path.suffix}",
                file=sys.stderr,
            )
            raise SystemExit(1)
        return [input_path]

    pattern = "**/*" if recursive else "*"
    files = [
        path
        for path in input_path.glob(pattern)
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
    return sorted(files)


def transcript_base_path(audio_path: Path, output_dir: Path | None) -> Path:
    if output_dir is None:
        return audio_path.with_suffix("")
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir / audio_path.stem


def write_text(path: Path, text: str) -> None:
    path.write_text(text.strip() + "\n", encoding="utf-8")


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def transcribe_files(
    audio_files: Iterable[Path],
    model_name: str,
    language: str | None,
    device: str | None,
    output_dir: Path | None,
    skip_existing: bool,
    save_json: bool,
) -> int:
    whisper = load_whisper()
    model = whisper.load_model(model_name, device=device)

    processed = 0
    for audio_path in audio_files:
        base_path = transcript_base_path(audio_path, output_dir)
        text_path = base_path.with_suffix(".txt")
        json_path = base_path.with_suffix(".json")

        if skip_existing and text_path.exists():
            print(f"Skipping existing transcript: {text_path}")
            continue

        print(f"Transcribing: {audio_path}")
        result = model.transcribe(str(audio_path), language=language)

        write_text(text_path, result["text"])
        print(f"Saved transcript: {text_path}")

        if save_json:
            write_json(json_path, result)
            print(f"Saved JSON: {json_path}")

        processed += 1

    return processed


def main() -> int:
    args = parse_args()
    ensure_ffmpeg()
    audio_files = collect_audio_files(args.input_path, args.recursive)

    if not audio_files:
        print("No supported audio files found.", file=sys.stderr)
        return 1

    processed = transcribe_files(
        audio_files=audio_files,
        model_name=args.model,
        language=args.language,
        device=args.device,
        output_dir=args.output_dir,
        skip_existing=args.skip_existing,
        save_json=args.save_json,
    )

    print(f"Finished. Transcribed {processed} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
