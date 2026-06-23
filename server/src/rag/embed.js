export const MODEL = process.env.EMBED_MODEL || 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
export const EMBED_DIM = 384;

let _embedderPromise = null;

async function getEmbedder() {
  if (!_embedderPromise) {
    
    const { pipeline, env } = await import('@xenova/transformers');
    env.allowLocalModels = false; 
    _embedderPromise = pipeline('feature-extraction', MODEL);
  }
  return _embedderPromise;
}

export async function embedTexts(texts) {
  const embedder = await getEmbedder();
  const vectors = [];
  for (const text of texts) {
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    vectors.push(Array.from(output.data));
  }
  return vectors;
}

export async function embedText(text) {
  const [v] = await embedTexts([text]);
  return v;
}
