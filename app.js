import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { calculatePoints } from './points-calculator.js';
import { validateReceipt } from './validators.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// In-memory storage
const receipts = new Map();

app.post('/receipts/process', async (req, res) => {
  const receipt = req.body;

  // Validate receipt schema
  const validationError = validateReceipt(receipt);
  if (validationError) {
    res.status(400).json({ error: validationError });
  } else {
    try {
      // Generate unique ID and store with its calculated points
      const id = uuidv4();
      const points = await calculatePoints(receipt);
      receipts.set(id, points);
      // console.log(receipts);

      res.status(200).json({ id });
    } catch (err) {
      console.error('Error processing receipt: ', err);
      res.status(500).json({ error: 'Internal server error processing receipt' });
    }
  }

})

app.get('/receipts/:id/points', (req, res) => {
  const id = req.params.id;
  const receiptData = receipts.get(id);

  if (!receiptData) {
    res.status(404).send({ error: 'No receipt found for that id' });
  } else {
    res.status(200).json({ points: receiptData });
  }

})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})

export { receipts, app };