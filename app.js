import express from 'express';
import cors from 'cors';
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const POINTS = {
  ALPHA_NUM: 1,
  ROUND_TOTAL: 50,
  MULTIPLE_OF_P25: 25,
  EACH_PAIR_ITEMS: 5,
  ITEM_DESC_MULT_OF_3: 0.2,
  ODD_DATE: 6,
  TIME_BETWEEN_2_4: 10,
}

const receipts = {};

const generateNewId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
})();

function alphaNumericRetailerPoints(retailer) {
  const regex = /[a-zA-Z0-9]/g;
  return retailer.match(regex).length * POINTS.ALPHA_NUM;
}

function roundTotalPoints(total) {
  return total % 1 > 0 ? 0 : POINTS.ROUND_TOTAL;
}

function multipleOfP25Points(total) {
  return total % 0.25 > 0 ? 0 : POINTS.MULTIPLE_OF_P25;
}

function itemPairsPoints(numItems) {
  return Math.floor(numItems / 2) * POINTS.EACH_PAIR_ITEMS;
}

function itemDescriptionPoints(items) {
  return (
    items.reduce((total, item) =>
      total + Math.ceil((item.shortDescription.trim().length % 3 > 0) ? 0 : (item.price * POINTS.ITEM_DESC_MULT_OF_3))
    , 0)
  )
}

function oddDatePoints(date) {
  const dateArray = date.split('-');
  const day = Number(dateArray[2]);
  return day % 2 === 0 ? 0 : POINTS.ODD_DATE;
}

function timeBetween2And4Points(time) {
  const timeArray = time.split(':');
  const hour = Number(timeArray[0]);
  return (hour >= 14 && hour <= 16) ? POINTS.TIME_BETWEEN_2_4 : 0;
}

function processReceipt(receipt) {
  const id = generateNewId();
  const { retailer, purchaseDate, purchaseTime, items } = receipt;
  const total = Number(receipt.total);

  const totalPoints =
    alphaNumericRetailerPoints(retailer) +
    roundTotalPoints(total) +
    multipleOfP25Points(total) +
    itemPairsPoints(items.length) +
    itemDescriptionPoints(items) +
    oddDatePoints(purchaseDate) +
    timeBetween2And4Points(purchaseTime)
  ;

  // store in memory
  receipts[id] = totalPoints;

  return {"id": id};
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
  const points = {"points": receipts[req.params.id]};
  res.status(200).json(points);
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})