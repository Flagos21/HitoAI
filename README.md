# HitoAI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Environment variables

The backend uses a `.env` file. An example file is provided at `backend/.env.example`. Copy this file and adjust the values for your setup. You also need an OpenAI API key to enable report generation:

```bash
cp backend/.env.example backend/.env
# then edit backend/.env and set OPENAI_API_KEY=your_key
```

## Development servers

### Backend

Install dependencies and start the API server:

```bash
cd backend
npm install
# If pdfkit, docx or chartjs-node-canvas are missing, install them explicitly
# npm install pdfkit docx chartjs-node-canvas@latest
# If you hit "No matching version" errors for chartjs-node-canvas, try:
# npm install chartjs-node-canvas@latest
# On Linux you may also need development headers for the `canvas` package:
# sudo apt-get install -y build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
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

To run the backend unit tests use:

```bash
npm test
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
# If pdfkit, docx or chartjs-node-canvas are missing, install them explicitly
# npm install pdfkit docx chartjs-node-canvas@latest
# On Linux you may also need development headers for the `canvas` package:
# sudo apt-get install -y build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
```

These dependencies include `pdfkit`, `docx` and `chartjs-node-canvas`, which are required to generate reports with charts.

Reports are saved under `backend/uploads/` and the API returns a ZIP file
containing both the PDF and Word versions.

If `pdfkit` is not installed, the generated ZIP will only include the Word
document because the PDF cannot be created. Make sure all optional
dependencies are installed if you need the PDF output.

### Troubleshooting

If you see an error like `Cannot find module 'pdfkit'` when starting the
backend, install the missing dependencies inside `backend/`:

```bash
cd backend

npm install pdfkit docx chartjs-node-canvas@latest
```

If `npm install` fails with a message like `No matching version found for chartjs-node-canvas@^4.2.2`,
install the latest version explicitly:

```bash
cd backend
npm install chartjs-node-canvas@latest

```

Without these packages the report generator will skip chart creation. If your
generated PDF or Word files are missing graphs, verify that `pdfkit`, `docx`
and `chartjs-node-canvas` are installed correctly.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
