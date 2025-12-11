import app from "./app.js";

const PORT: number = (process.env.PORT as unknown as number) || 8000;

app.listen(PORT, () =>
  console.info(` 🚀 Server is listening on port: http://localhost:${PORT}`)
);
