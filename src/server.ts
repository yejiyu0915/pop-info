import 'reflect-metadata';
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  if (env.NODE_ENV !== 'production') {
    console.log(`Swagger docs: http://localhost:${env.PORT}/api-docs`);
  }
});
