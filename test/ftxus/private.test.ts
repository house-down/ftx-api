import { RestClient } from "../../src/rest-client";
import { successResponseList } from "../response.util";

// readonly
describe('FTX.us private endpoints', () => {
  const API_KEY = process.env.API_KEY_US_READONLY;
  const API_SECRET = process.env.API_SECRET_US_READONLY;

  const api = new RestClient(API_KEY, API_SECRET, {
    domain: 'ftxus',
  });

  it('should get subaccounts', async () => {
    expect(await api.getSubaccounts()).toMatchObject({
      "result": [
        {
          "nickname": "usacc1",
        }
      ],
      "success": true
    });
  });

  it('should get balances', async () => {
    expect(await api.getBalances()).toMatchObject(successResponseList());
  });

  it('should place orders', async () => {
    const market = 'BTC/USD';
    const type = 'market';

    const buyAmount = 0.0001;

    try {
      const result = await api.placeOrder({
        market,
        type,
        side: 'buy',
        size: buyAmount,
        price: null
      });
      expect(result).toMatchObject({
        "result": {
          "filledSize": expect.any(Number),
          "id": expect.any(Number),
          "market": market,
          "postOnly": false,
          "price": null,
          "reduceOnly": false,
          "remainingSize": expect.any(Number),
          "side": "buy",
          "size": buyAmount,
          "status": expect.any(String),
          "type": type
        },
        "success": true
      });
    } catch (e) {
      console.error('exception: ', e);
      expect(e).toBeUndefined();
    }

    // sleep to allow order fill
    await new Promise(resolve => setTimeout(resolve, 100));

    const balances = await api.getBalances();
    const balanceBtc = balances.result.find(bal => bal.coin === 'BTC');

    try {
      const result = await api.placeOrder({
        market,
        type,
        side: 'sell',
        size: Number(balanceBtc.free),
        price: null
      });
      expect(result).toMatchObject({
        "result": {
          "filledSize": expect.any(Number),
          "id": expect.any(Number),
          "market": market,
          "postOnly": false,
          "price": null,
          "reduceOnly": false,
          "remainingSize": expect.any(Number),
          "side": "sell",
          "size": expect.any(Number),
          "status": expect.any(String),
          "type": type
        },
        "success": true
      });
    } catch (e) {
      console.error('sell exception: ', e);
      expect(e).toBeUndefined();
    }

  });
});
