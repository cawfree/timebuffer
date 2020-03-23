# timebuffer
Simple segmentation of timeboxed data handlers. Easily distribute periodic messages to dedicated handlers.

## 🚀 Getting Started

Using [`npm`]():

```sh
npm i -s @cawfree/timebuffer
```

Using [`yarn`]():

```sh
yarn add @cawfree/timebuffer
```

## ✍️ Usage

Through calls to `use()`, we can define multiple timeboxed handlers; these declare which channels of data they're sensitive to, and will receive an aggregate collection of this data via the specified callback. In addition, they will receive the data supplied from the previous execution frame, to aid  comparison between periods of data.

Each declared channel of sensitivity will be returned by the `TimeBuffer` instance, which will manage segmentation and garbage collection.

```javascript
import TimeBuffer from "timebuffer";

const { population, currency } = new TimeBuffer()
  // XXX: Process all currency values in 1000ms intervals.
  .use(['currency'], 1000, (nextProps, lastProps) => {
    const { currency: nextCurrency } = nextProps;
    const { currency: lastCurrency } = lastProps;
  })
  // XXX: Process all currency and population values in 2000ms intervals.
  .use(['currency', 'population'], 2000, (nextProps, lastProps) => {
    const { population: nextPopulation } = nextProps;
    const { currency: lastCurrency } = lastProps;
  });

// XXX: Post values of population and currency.
population(5000);
currency(200);
currency(250);

await new Promise(resolve => setTimeout(resolve, 10000));

population(2500);
currency(44);
```

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)
