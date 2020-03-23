import "@babel/polyfill";

import { typeCheck } from "type-check";

import TimeBuffer from "../src";

jest.setTimeout(5 * 60 * 1000);

it("should throw on invalid parameters", async () => {
  expect(() => new TimeBuffer().use()).toThrow();
  expect(() => new TimeBuffer(["use"], 500, () => null).use()).toThrow();
  expect(() => new TimeBuffer([], 500, () => null).use()).toThrow();
  expect(() => new TimeBuffer(["date"], -1, () => null).use()).toThrow();
  expect(() => new TimeBuffer(["date"], 1.1, () => null).use()).toThrow();
});

it("should export functions that correspond to the declared handlers", async () => {
  const { date, currency } = new TimeBuffer()
    .use(["date"], 500, () => null)
    .use(["currency", "date"], 500, () => null);

  expect(typeCheck("Function", date)).toEqual(true);
  expect(typeCheck("Function", currency)).toEqual(true);
});

it("should timebox distribution of data", async () => {
  const received = [];
  const { number } = new TimeBuffer().use(
    ["number"],
    2000,
    (nextProps, lastProps) => received.push({ nextProps, lastProps })
  );

  number(1);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  number(2);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  /* nothing */
  await new Promise((resolve) => setTimeout(resolve, 3000));

  expect(received).toEqual([
    { nextProps: { number: [2] }, lastProps: { number: [1] } },
    { nextProps: { number: [] }, lastProps: { number: [2] } },
    { nextProps: { number: [] }, lastProps: { number: [] } },
  ]);
});
