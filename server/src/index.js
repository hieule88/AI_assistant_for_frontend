import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { runGenerate, runEdit } from './pipeline.js';
import { ParseError } from './parser.js';
import { listBrands, createBrand } from './brands.js';
import { addComponent, updateComponent, removeComponent, listAllComponents } from './rag/ingest.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mock: process.env.MOCK_MODE === '1', model: process.env.QWEN_MODEL || 'mock' });
});

app.post('/api/generate', async (req, res) => {
  const { description, language, brandId } = req.body || {};
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Thiếu "description" (string)' });
  }
  try {
    const result = await runGenerate({ description, language, brandId });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/edit', async (req, res) => {
  const { files, instruction, language } = req.body || {};
  if (!Array.isArray(files) || !instruction) {
    return res.status(400).json({ error: 'Cần "files" (array) và "instruction" (string)' });
  }
  try {
    const result = await runEdit({ files, instruction, language });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/api/brands', (req, res) => {
  res.json({ brands: listBrands() });
});

app.post('/api/brands', (req, res) => {
  try {
    const { name, colors, font, logo } = req.body || {};
    res.json(createBrand({ name, colors, font, logo }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/components', (req, res) => {
  res.json(listAllComponents());
});

app.post('/api/components', async (req, res) => {
  try {
    const { name, description, tags, brand, code } = req.body || {};
    const item = await addComponent({ name, description, tags, brand, code });
    res.json({ id: item.id, name: item.name, tags: item.tags, brand: item.brand || '' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/components/:id', async (req, res) => {
  try {
    const { name, description, tags, brand, code } = req.body || {};
    const item = await updateComponent(req.params.id, { name, description, tags, brand, code });
    res.json({ id: item.id, name: item.name, tags: item.tags, brand: item.brand || '' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/components/:id', async (req, res) => {
  try {
    await removeComponent(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function handleError(res, err) {
  console.error(err);
  if (err instanceof ParseError) {
    return res.status(502).json({ error: err.message, raw: err.raw });
  }
  res.status(500).json({ error: err.message || 'Lỗi server' });
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  const mode = process.env.MOCK_MODE === '1' ? 'MOCK' : process.env.QWEN_MODEL;
  console.log(`[server] http://localhost:${PORT}  (mode: ${mode})`);
});
