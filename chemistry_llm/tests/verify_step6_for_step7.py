"""Verification of Step 6 prerequisites for Step 7."""

import torch
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint
from chemistry_llm.evaluation.evaluator import generate_response

def verify_step6():
    print("1. Verifying Step 6 Tokenizer...")
    tok = ChemNovaTokenizer()
    assert tok.vocab_size == 4096, "Tokenizer vocab mismatch!"
    print(f"   Tokenizer vocab size: {tok.vocab_size}")

    print("2. Verifying Step 6 Instruction Checkpoint...")
    cfg = ChemNovaModelConfig(vocabulary_size=tok.vocab_size, context_length=512)
    model = ChemNovaTransformerLM(cfg)
    chk = load_checkpoint('chemistry_llm/instruction_checkpoints/best_model', model=model)
    step = chk.get('step')
    loss = chk.get('loss')
    val_loss = chk.get('val_loss')
    print(f"   Step 6 Checkpoint loaded: step={step}, loss={loss:.4f}, val_loss={val_loss:.4f}")

    print("3. Verifying Local Text Generation...")
    prompt = '<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n<QUESTION>\nWhat is water?\n</QUESTION>\n<ANSWER>\n'
    out = generate_response(model, tok, prompt, max_new_tokens=32, temperature=0.7)
    print(f"   Sample Generation: {repr(out)}")
    assert len(out.strip()) > 0, "Empty generation!"

    print("ALL STEP 6 PREREQUISITES VERIFIED SUCCESSFULLY FOR STEP 7!")

if __name__ == "__main__":
    verify_step6()
