
const fetch = require("isomorphic-fetch");

async function getInventory() {
  const response = await fetch(
    "https://dev.emi-project.my.id/v1/barang-filter?page=1&limit=10&order=asc",
    {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "User-Id": 8
      },
    }
  );
  const data = await response.json();
  return data;
}

test("Inventory testing", async () => {
  const data = await getInventory();
  expect(data.success).toEqual(true);
});
