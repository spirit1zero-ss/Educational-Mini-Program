# 2026-06-15 Modification instructions

## This time's goal

Open the basic data link between the self-learning training camp H5 and the local CRMEB backend, and clean up temporary mocks, old builds and preview configurations according to conservative strategies.

## Front-end H5 modification

- Keep all current H5 pages: home page, training camp, evaluation, growth files, my training camp, invite friends, team center, and commission center.
- Added CRMEB API access layer:
  - `src/api/crmebClient.js`
  - `src/api/training.js`
  - `src/hooks/useCrmebData.js`
- H5 requests are uniformly routed to `/api`, and the development environment is proxied by Vite to the local CRMEB backend `http://127.0.0.1:8080`.
- The training camp page has read the CRMEB product list interface and displays background product name, price, sales volume, opening time and other information.
- The My, Invitation, Team, and Commission pages have priority to read the CRMEB User/Distribution/Commission interface.
- When the interface fails, you are not logged in, or there is no data, the page will fall back to the demo data and clearly display "demo data", which will not be mistakenly marked as CRMEB data.
- The relative image path returned by CRMEB will automatically be supplemented with the local backend domain name to avoid invalidation of the H5 image address.

## CRMEB/Build configuration modification

- `vite.config.js` uses `loadEnv` instead to read environment variables.
- H5 build output is unified into the CRMEB backend static directory:
  - `src/CRMEB/CRMEB-master/crmeb/public/h5`
- `.env.example` retains local joint debugging configuration example:
  - `VITE_CRMEB_API_BASE=/api`
  - `VITE_CRMEB_API_ORIGIN=http://127.0.0.1:8080`
  - `VITE_CRMEB_TOKEN_KEY=Authori-zation`
- Local `.env` is configured with the same development backend address, but will not be committed to Git.

## Adjustments related to background and mini programs

- The CRMEB backend product editing page retains the simplified logic of the MVP training camp direction.
- UniApp/mini program product details retain the MVP training camp product filtering logic.
- The source code of the CRMEB backend, background, UniApp, and mini program templates is retained without destructive streamlining.

## Clean content

- Delete the temporary WeChat preview configuration in the root directory:
  - `project.config.json`
  - `project.private.config.json`
- Empty old `dist/` build files.
- Clear the `.wechat-local-data/` mock service file.
- The CRMEB official directory has not been deleted:
  - `src/CRMEB/CRMEB-master/crmeb`
  - `src/CRMEB/CRMEB-master/template/admin`
  - `src/CRMEB/CRMEB-master/template/uni-app`
  - `src/CRMEB/CRMEB-master/crmeb/public/statics/mp_view`

## Test results

- `npm run build` passes.
- H5 development services are available at:
  - `http://127.0.0.1:5173/`
- H5 build product has been generated:
  - `src/CRMEB/CRMEB-master/crmeb/public/h5/index.html`
  - `src/CRMEB/CRMEB-master/crmeb/public/h5/assets/*`
- In the current environment, `http://127.0.0.1:8080` has not detected the real CRMEB PHP/Docker backend service, so the real backend interface joint debugging has not been completed.
- The front-end proxy `/api` will fail when the backend is not started, but the page has demo data fallback capabilities.

## Follow-up suggestions

- After starting the real CRMEB backend, retest:
  - `http://127.0.0.1:8080/admin`
  - `http://127.0.0.1:8080/api/products`
  - `http://127.0.0.1:5173/#/camp`
- To fully back-end education data, the next phase will add the `education_*` table and `/api/education/*` interface for persistence of assessment results, growth files, and training camp progress.
