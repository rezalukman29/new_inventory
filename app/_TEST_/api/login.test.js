
const fetch = require("isomorphic-fetch");

async function postLogin(body) {
  const response = await fetch(
    "https://emi-backend-staging.emi-project.my.id/v1/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }
  );
  const data = await response.json();
  return data;
}

test("Login testing", async () => {
  const data = await postLogin({
    email: "monatasolole@gmail.com",
    password: "Saras008@",
  });
  expect(data.success).toEqual(true);
});
