import express from 'express';
import cors from 'cors';
import { calculatePoints } from './points-calculator.js';
import { validateReceipt } from './validators.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const receipts = new Map();

const generateNewId = (() => {
  // eventually return uuid instead
  let id = 0;
  return () => {
    id += 1;
    return id.toString();
  };
})();

app.post('/receipts/process', async (req, res) => {
  const receipt = req.body;
  const validationError = validateReceipt(receipt);
  if (validationError) {
    console.log(validationError);
    res.status(400).json({ error: validationError });
  } else {
    try {
      const points = await calculatePoints(receipt);
      const id = generateNewId();

      // store in memory
      receipts.set(id, points);
      console.log(receipts);

      res.status(200).json({ id });
    } catch (err) {
      console.error('Error processing receipt: ', err);
    }
  }

})

app.get('/receipts/:id/points', (req, res) => {
  const id = req.params.id;
  console.log('id', id);
  const receiptData = receipts.get(id);
  console.log('receiptData', receiptData);

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