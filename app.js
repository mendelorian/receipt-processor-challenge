import express from 'express';
import cors from 'cors';
import { calculatePoints } from './points-calculator.js';
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const receipts = new Map();

const generateNewId = (() => {
  // eventually return uuid, return as string in anticipation of this
  let id = 0;
  return () => {
    id += 1;
    return id.toString();
  };
})();

async function processReceipt(receipt) {
  try {
    const id = await generateNewId();
    const points = await calculatePoints(receipt);

    // store in memory
    receipts.set(id, points);
    return { id };
  } catch (err) {
    console.error('Error during receipt processing: ', err);
  }

}

app.post('/receipts/process', async (req, res) => {
  try {
    const result = await processReceipt(req.body);
    console.log(result, receipts);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error occurred processing receipt: ', err);
    res.status(400).send('The receipt is invalid');
  }
})

app.get('/receipts/:id/points', (req, res) => {
  const points = {"points": receipts.get(req.params.id)};
  res.status(200).json(points);
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})

export { processReceipt, receipts };