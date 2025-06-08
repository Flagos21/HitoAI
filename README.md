# HitoAI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Environment variables

The backend uses a `.env` file. An example file is provided at `backend/.env.example`. Copy this file and adjust the values for your setup. You also need an OpenAI API key to enable report generation:

```bash
cp backend/.env.example backend/.env
# then edit backend/.env and set OPENAI_KEY=your_key
```

## Development servers

### Backend

Install dependencies and start the API server:

```bash
cd backend
npm install
node app.js
```

### Frontend

From the project root run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Backend server

To start the backend API, change into the `backend/` directory and run:

```bash
npm start
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Automatic subject reports

The backend exposes `/api/informe/:asignaturaId` to generate a full PDF
and Word report for a given course. Make sure you install backend
dependencies before running the server:

```bash
cd backend
npm install
```

These dependencies include `pdfkit`, `docx` and `chartjs-node-canvas`, which are required to generate reports with charts.

Reports are saved under `backend/uploads/` and returned directly in the
HTTP response.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
