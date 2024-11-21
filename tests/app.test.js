import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { receipts, app } from '../app.js';

vi.mock('uuid', () => {
  // incrementing 4 digit number
  const generateNewId = (() => {
    let id = 1000;
    return () => {
      id += 1;
      return id.toString();
    }
  })();

  return {
    v4: () => `test-uuid-${generateNewId()}`
  }
}

)

describe('Receipt Processing API', () => {
  const simpleReceipt = {
    "retailer": "Target",
    "purchaseDate": "2022-01-02",
    "purchaseTime": "13:13",
    "total": "1.25",
    "items": [
        {"shortDescription": "Pepsi - 12-oz", "price": "1.25"}
    ]
  };

  const morningReceipt = {
    "retailer": "Walgreens",
    "purchaseDate": "2022-01-02",
    "purchaseTime": "08:13",
    "total": "2.65",
    "items": [
        {"shortDescription": "Pepsi - 12-oz", "price": "1.25"},
        {"shortDescription": "Dasani", "price": "1.40"}
    ]
  };

  describe('POST /receipts/process', () => {
    // clear in-memory receipts before each test
    beforeEach(() => {
      for (const key of receipts) {
        receipts.delete(key);
      }
    })

    it('should process a valid receipt', async () => {

      const response = await request(app)
        .post('/receipts/process')
        .send(simpleReceipt)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toEqual('test-uuid-1001');
    })

    // no longer useful test after mocking uuid
    it.skip('should assign a unique ID for each receipt', async () => {

      const response1 = await request(app)
        .post('/receipts/process')
        .send(simpleReceipt);

        const response2 = await request(app)
        .post('/receipts/process')
        .send(morningReceipt);

      expect(response1.body).toHaveProperty('id');
      expect(response2.body).toHaveProperty('id');
      expect(response1.body.id).not.toBe(response2.body.id);
    })

    it('should correctly calculate and store points', async () => {
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

      const response = await request(app)
        .post('/receipts/process')
        .send(receipt);

      const id = response.body.id;
      const expectedPoints = 28;
      expect(receipts.get(id)).toEqual(expectedPoints);
    })

    it('should reject an invalid receipt format', async () => {
      const invalidReceipt = {
        "retailer": "Target"
      };

      await request(app)
        .post('/receipts/process')
        .send(invalidReceipt)
        .expect(400)
        .expect('Content-Type', /json/);
    })

    it('should reject a receipt with an invalid retailer name format', async () => {
      const invalidReceipt = {
        "retailer": "Target!!",
        "purchaseDate": "2022-01-02",
        "purchaseTime": "13:13",
        "total": "1.25",
        "items": [
            {"shortDescription": "Pepsi - 12-oz", "price": "1.25"}
        ]
      };

      const response = await request(app)
        .post('/receipts/process')
        .send(invalidReceipt)
        .expect(400)
        expect('Content-Type', /json/);

      expect(response.body.error).toContain('Invalid retailer name format');
    })

    // Add tests for other validator cases if desired
  })

  describe('GET /receipts/:id/points', () => {
    it('should return the points for a valid receipt ID', async () => {
      const receipt = {
        "retailer": "M&M Corner Market",
        "purchaseDate": "2022-03-20",
        "purchaseTime": "14:33",
        "items": [
          {
            "shortDescription": "Gatorade",
            "price": "2.25"
          },{
            "shortDescription": "Gatorade",
            "price": "2.25"
          },{
            "shortDescription": "Gatorade",
            "price": "2.25"
          },{
            "shortDescription": "Gatorade",
            "price": "2.25"
          }
        ],
        "total": "9.00"
      };

      const postResponse = await request(app)
        .post('/receipts/process')
        .send(receipt);

      const id = postResponse.body.id;

      const response = await request(app)
        .get(`/receipts/${id}/points`)
        .expect(200)
        .expect('Content-Type', /json/);

      const expectedPoints = 109;
      expect(response.body).toHaveProperty('points');
      expect(response.body.points).toBeTypeOf('number');
      expect(response.body.points).toEqual(expectedPoints);
    })

    it('should return 404 status for non-existent receipt ID', async () => {
      const response = await request(app)
        .get(`/receipts/non-existent-id/points`)
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body.error).toContain('No receipt found for that id');
    })
  })

})