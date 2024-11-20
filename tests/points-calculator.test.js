import { describe, it, expect } from 'vitest';
import { calculatePoints } from '../points-calculator.js';

const POINT_VALUES = {
  ALPHA_NUM: 1,
  ROUND_TOTAL: 50,
  MULTIPLE_OF_P25: 25,
  EACH_PAIR_ITEMS: 5,
  ITEM_DESC_MULT_OF_3: 0.2,
  ODD_DATE: 6,
  TIME_BETWEEN_2_4: 10,
};

describe('Points Calculator', () => {
  it('should return correct points for a sample receipt', async () => {
    const receipt = {
      "retailer": "Target",
      "purchaseDate": "2022-01-01",
      "purchaseTime": "13:01",
      "items": [
        {
          "shortDescription": "Mountain Dew 12PK",
          "price": "6.49"
        },{
          "shortDescription": "Emils Cheese Pizza",
          "price": "12.25"
        },{
          "shortDescription": "Knorr Creamy Chicken",
          "price": "1.26"
        },{
          "shortDescription": "Doritos Nacho Cheese",
          "price": "3.35"
        },{
          "shortDescription": "   Klarbrunn 12-PK 12 FL OZ  ",
          "price": "12.00"
        }
      ],
      "total": "35.35"
    };

    const expectedPoints =
      6 * POINT_VALUES.ALPHA_NUM + // retailer name has 6 characters @ 1 point each
      Math.floor(receipt.items.length / 2) * POINT_VALUES.EACH_PAIR_ITEMS + // 4 items = 2 pairs @ 5 points each
      Math.ceil(12.25 * POINT_VALUES.ITEM_DESC_MULT_OF_3) + // "Emils Cheese Pizza" is 18 chars (mult of 3), price 12.25
      Math.ceil(12 * POINT_VALUES.ITEM_DESC_MULT_OF_3) + // "Klarbrunn 12-PK 12 FL OZ" is 24 chars (mult of 3), price 12.00
      POINT_VALUES.ODD_DATE; // purchase day 01 is odd

    const result = await calculatePoints(receipt);
    expect(result).toEqual(expectedPoints);
  })

  it('should return 0 points for an empty receipt', async () => {
    const receipt = {
      retailer: '',
      purchaseDate: '2024-11-02',
      purchaseTime: '09:00',
      items: [],
      total: '0.01'
    };

    const expectedPoints = 0;
    const result = await calculatePoints(receipt);
    expect(result).toEqual(expectedPoints);
  })

  it.skip('should award 1 point for each alphanumberic character in retailer name', async () => {

  })

  it.skip('should award 50 points if the total is a round dollar amount with no cents', async () => {

  })

  it.skip('should award 25 points if the total is a multiple of 0.25', async () => {

  })

  it.skip('should award 5 points for every two items on the receipt', async () => {

  })

  it('should award (item price * 0.2) points for an item if the trimmed length of the description is multiple of 3', async () => {
    const receipt = {
      retailer: '',
      purchaseDate: '2024-11-02',
      purchaseTime: '09:00',
      items: [
        { shortDescription: 'ABC', price: 6.00 },
        { shortDescription: 'DEF', price: 12.00 },
      ],
      total: '25.21'
    };

    const expectedPoints =
      POINT_VALUES.EACH_PAIR_ITEMS + // single pair
      Math.ceil(receipt.items[0].price * POINT_VALUES.ITEM_DESC_MULT_OF_3) +
      Math.ceil(receipt.items[1].price * POINT_VALUES.ITEM_DESC_MULT_OF_3);
    const result = await calculatePoints(receipt);
    expect(result).toEqual(expectedPoints);
  })

  it('should award correct points if odd purchase date (day) & round total & total is multiple of 0.25', async () => {
    const receipt = {
      retailer: '',
      purchaseDate: '2024-11-21',
      purchaseTime: '12:00',
      items: [],
      total: '100.00'
    };

    const expectedPoints =
      POINT_VALUES.ODD_DATE +
      POINT_VALUES.ROUND_TOTAL +
      POINT_VALUES.MULTIPLE_OF_P25;

    const result = await calculatePoints(receipt);
    expect(result).toEqual(expectedPoints);
  })

  it.skip('should award 10 points if purchase time is between 2pm and 4pm', async () => {

  })
})