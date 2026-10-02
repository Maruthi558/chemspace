import torch
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint

tok = ChemNovaTokenizer()
cfg = ChemNovaModelConfig(
    vocabulary_size=tok.vocab_size,
    context_length=512,
    embedding_dimension=128,
    number_of_layers=4,
    number_of_attention_heads=4,
    feed_forward_dimension=512,
)
model = ChemNovaTransformerLM(cfg)
load_checkpoint('chemistry_llm/instruction_checkpoints/best_model', model=model)
model.eval()

from chemistry_llm.evaluation.evaluator import generate_response

prompt = '<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n<QUESTION>\nWhat is a covalent bond?\n</QUESTION>\n<ANSWER>\n'

for temp in [0.0, 0.7, 1.0]:
    res = generate_response(model, tok, prompt, max_new_tokens=48, temperature=temp)
    print(f"Temp {temp}: {repr(res)}")
