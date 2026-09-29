import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    if ('serviceWorker' in navigator) {

      window.addEventListener('load', async () => {

        try {

          const registro = await navigator.serviceWorker.register('/service-worker.js');

          console.log('Service Worker registrado correctamente:', registro.scope);

          console.log('Página controlada:', navigator.serviceWorker.controller);

        } catch (error) {

          console.error('Error al registrar Service Worker:', error);
        }

      });

    }
  })
  .catch((err) => console.error(err));
