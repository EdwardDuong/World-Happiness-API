# QUT CAB 230 Assignment 2 Tests

## Here we provide the test suite that will be used in assessing your server.

To run the tests, first install the dependencies, make sure that your server is running and then run the test command as shown:

```bash
npm install
npm test
```

By default we test `http://localhost:3000`, however you may change the URL setting to suit your system by editing the definition in the file `integration.tests.js`:

```javascript
//If you are serving your server on any port other than 3000, change the port here, or alternatively change the url as approriate
const REMOTE_API_URL = `http://localhost:3000`;
```

## After each run

After each run, you will see output on the screen, but if there are a number of errors you will find it easier to browse the `report.html` file which will appear in the top directory. This will give you a good idea of how your server is behaving. Ideally you'd want to see all 306 tests passing. If you aren't sure what is going wrong, have a look at the messages and then dig directly into the code itself - the file `integration.tests.js`. If you are unsure of the behaviour, look at the Swagger or hit the endpoint with postman to debug. An example version of this file - `example.html` - may be found in the top directory.

## Some more detail

If you look through the code itself you will notice that there are different types of tests. For some of them, we are happy just to confirm that:

- The status code is correct
- The error key is is correct
- A message exists

Here is an example of that sort of test code:

```javascript
test("should return status code 400", () => expect(response.status).toBe(404));
test("should return error with boolean value true", () =>
  expect(response.error).toBe(true));
test("should contain message property", () =>
  expect(response.data).toHaveProperty("message"));
```

In other cases, you will want to verify that the actual results are correct:

```javascript
test("should return status code 200", () => expect(response.status).toBe(200));
test("should return status OK", () => expect(response.statusText).toBe("OK"));
test("should contain correct name property", () =>
  expect(response.data[0].rank).toBe(1));
test("should contain correct symbol property", () =>
  expect(response.data[0].country).toBe("Finland"));
test("should contain correct industry property", () =>
  expect(response.data[0].score).toBe("7.809"));
test("should contain correct timestamp property", () =>
  expect(response.data[0].year).toBe("2020"));
```

and so on. The giveaway is the `expect().toBe()` which makes it clear that we have a specific value in mind. The tests are your friend.

## Will they change?

We will not introduce other test conditions. We reserve the right to change the data. So, for example, many of these tests use the country of `Finland` or `Australia`. We might decide to change to another country or year. The tests will use different data, but they will be testing the same thing. If you hardcode your responses, we will find out and we won't be impressed. If you can pass these tests legitimately, then you will be fine.
