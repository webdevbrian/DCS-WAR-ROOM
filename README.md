# DCS-WAR-ROOM
A digital combat simulator flight and combat stats system powered by tacview

---

## **Requirements**
[SQL Lite Studio](https://sqlitestudio.pl/) - Great for dealing with the SQL Lite database

[Tacview](https://www.tacview.net/product/about/en/) - You do not need the paid for version, but you need the free or paid version installed, it's a great app and I highly encourage you to purchase this - they are a great group of devs!

[Digital Combat Simulator](https://www.digitalcombatsimulator.com/en/) - You don't necessarily need this installed but the tacview files are generated from DCS while it's running.

---

## **General tasks**
[X] Build base repository

[X] Build base SQLite database for data imports and management

[X] Run test imports of tacview exports

[X] Create default SQLite database and git ignore `main_db.sqlite3` to retain clean database reference

---

## **Tooling**
[X] Build tool for automating tacview file csv exports to `flightlogimports table` and `flightlogs` in database

---

## **User interface for data management (importing and other)**

[](Create frame work that utilizes bootstrap or otherwise in a HTML / web interface for interaction)

[IN PROGRESS](Create interface for database associations for pilot duplication)

---

## **Visualization**

COMING SOON(tm)

---

## **Database**

Below is a list of the current tables and columns currently used in the database with a description of it's data. This is so when you're poking around looking at the data you understand some of the types but more importantly how some of the data is formatted as to avoid confusion.

### **Tables and columns**

> TABLE: **flightlogimports**
>
> **Description**: This table is structured to take all tacview flightlog csv exports directly with the addition of a `flightlog_id` and `id` column for flight log import tracking / references for later retreiving. The flight logs are imported into this table by omitting the first column which has the column headers (named as the ones in this table).

> TABLE: **flightlogs**
>
> **Description**: This table is for tracking the actual flight log file imports with the tool. The `id` column here is referenced to the `flightlog_id` in the `flightlogimports` table for association purposes for later database querying.

> TABLE: **munitions**
>
> **Description**: The idea with this table is to reference this data for a later implementation of total munitions used and spent with cost calculations. Later on, it may be fun to explore a system which incorporates calculating munition expendature per mission, per pilot for future use. Like an amazon.com version for bombs! No idea, just thought this would be fun and could open up some potential future moves with the system in whole. This should ideally be controlled by a UI for the user running this system for their group so they can add munitions and costs per munition.

> TABLE: **pilotdata**
>
> **Description**: This table tracks overall pilot data as it pertains to the system for statistics. There are some interesting columns in here that need to be talked about how they will be formatted as it will probably be confusing to people who have no idea going into this what they're looking at! So let's demystify that.
>
> The three main columns that differ from ones like `kills` and `deaths` which should be self explanatory (this is OVERALL kills and deaths across all imported missions) are the columns `flights_flown` and `landings`. These three are dynamically updated arrays for each given tracked pilot. They are associative in that the first in the order for `aircraft_flown` will then have a tracked array slot in `flights_flown` and `landings` *so that each airframe flown by this pilot has tracked data for the amount of flights flown and landings of that airframe, not all airframes together!* I did this so that we can get more specific data about landings and flights for each specific airframe for later data comparisons and visualizations. Please note: The way this is "judged" is that a `hastakenoff` event matches a following `haslanded` event from tacview. That is what I've judged in the code as a successful and log-able flight. If the pilot takes off and doesn't land (i.e. they DIE!) welp let's not track that. You can find the accompanying part in the code to change this, and, in the future I may provide different selectable system options to calculate this to people's likings via a selection i.e. "select default flight calculation / etc".

## Quick start

Make sure you have [Node.js](https://nodejs.org) installed, then type...
```
git clone git@github.com:webdevbrian/DCS-WAR-ROOM.git
cd DCS-WAR-ROOM
npm install
npm start
```
...and you have a running desktop application on your screen.

## Structure of the project

The application consists of two main folders...

`src` - files within this folder get transpiled or compiled (because Electron can't use them directly).

`app` - contains all static assets which don't need any pre-processing and can be used directly.

The build process compiles the content of the `src` folder and puts it into the `app` folder, so after the build has finished, your `app` folder contains the full, runnable application. Treat `src` and `app` folders like two halves of one bigger thing.

The drawback of this design is that `app` folder contains some files which should be git-ignored and some which shouldn't (see `.gitignore` file). But this two-folders split makes development builds much faster.

## Development

### Starting the app

```
npm start
```

### The build pipeline

Build process uses [Webpack](https://webpack.js.org/). The entry-points are `src/main.js` and `src/app.js`. Webpack will follow all `import` statements starting from those files and compile code of the whole dependency tree into one `.js` file for each entry point.

[Babel](http://babeljs.io/) is also utilised, but mainly for its great error messages. Electron under the hood runs latest Chromium, hence most of the new JavaScript features are already natively supported.

### Environments

Environmental variables are done in a bit different way (not via `process.env`). Env files are plain JSONs in `config` directory, and build process dynamically links one of them as an `env` module.
```js
import env from "env";
console.log(env.name);
```

### Adding npm modules

Remember to respect the split between `dependencies` and `devDependencies` in `package.json` file. This app will contain only modules listed in `dependencies` after running the release script.

*Side note:* If the module you want to use is a native one (not pure JavaScript but compiled binary) you should first  run `npm install name_of_npm_module` and then `npm run postinstall` to rebuild the module for Electron. You need to do this once after you're first time installing the module. Later on, the postinstall script will fire automatically with every `npm install`.

## Testing

Run all tests:
```
npm test
```

### Unit

```
npm run unit
```
Using [electron-mocha](https://github.com/jprichardson/electron-mocha) test runner with the [Chai](http://chaijs.com/api/assert/) assertion library. You can put your spec files wherever you want within the `src` directory, just name them with the `.spec.js` extension.

### End to end

```
npm run e2e
```
Using [Mocha](https://mochajs.org/) and [Spectron](http://electron.atom.io/spectron/). This task will run all files in `e2e` directory with `.e2e.js` extension.

## Making a release

To package your app into an installer use command:
```
npm run release
```

Once the packaging process finished, the `dist` directory will contain your distributable file.

[Electron-builder](https://github.com/electron-userland/electron-builder) is handling the packaging process. Follow docs over there to customise your build.

You can package your app cross-platform from a single operating system, [electron-builder kind of supports this](https://www.electron.build/multi-platform-build), but there are limitations and asterisks. That's why this boilerplate doesn't do that by default.

This project is based off of  "electron-boilerplate"