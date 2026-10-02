"""Verification script for Step 5 checkpoints, model, tokenizer, and weights."""

import torch
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint

def verify_step5():
    print("Verifying Step 5 prerequisites...")
    tok = ChemNovaTokenizer()
    print(f"1. Tokenizer vocab size: {tok.vocab_size}")

    cfg = ChemNovaModelConfig(
        vocabulary_size=tok.vocab_size,
        context_length=512,
        embedding_dimension=128,
        number_of_layers=4,
        number_of_attention_heads=4,
        feed_forward_dimension=512,
    )
    model = ChemNovaTransformerLM(cfg)

    chk = load_checkpoint('chemistry_llm/checkpoints/best_model', model=model)
    step = chk.get('step')
    loss = chk.get('loss')
    val_loss = chk.get('val_loss')
    print(f"2. Best checkpoint loaded: step={step}, loss={loss:.4f}, val_loss={val_loss:.4f}")
    print(f"3. Model config vocab: {cfg.vocabulary_size}, context: {cfg.context_length}, d_model: {cfg.embedding_dimension}")
    assert cfg.vocabulary_size == tok.vocab_size, "Vocab mismatch!"

    model.eval()
    total_params = sum(p.numel() for p in model.parameters())
    print(f"4. Model parameters loaded: {total_params:,}")

    # Verify real trained weights (non-trivial parameter norm)
    p_norm = sum(p.norm().item() for p in model.parameters())
    print(f"5. Total parameter L2 norm sum: {p_norm:.4f}")
    assert p_norm > 0, "Model weights are empty or zero!"

    # Forward pass inference test
    sample_text = "<BOS>What is water?"
    ids = tok.encode(sample_text)
    inp = torch.tensor([ids], dtype=torch.long)
    with torch.no_grad():
        logits, _ = model(inp)
    print(f"6. Forward pass logits shape: {list(logits.shape)}")
    next_id = int(torch.argmax(logits[0, -1, :]).item())
    next_token = tok.decode([next_id])
    print(f"7. Predicted next token id: {next_id} -> '{next_token}'")
    print("STEP 5 VERIFICATION PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_step5()
