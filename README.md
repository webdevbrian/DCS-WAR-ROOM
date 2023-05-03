# DCS-WAR-ROOM
A digital combat simulator stats system powered by tacview.

Please remember this application is VERY much alpha level and there ARE ( and will be ) plenty of bugs!

---

**!!!Please read this ENTIRE read me before asking questions / pull requests / adding issues etc!!!**

---

![DCS War Room Homepage](https://i.imgur.com/eimeaRR.jpg)

## Why?
I wanted an app where I could track my stats regardless of which server I was on. I've been apart of a DCS flight group for about two years and one specific thing stuck out was that I'd like to start tracking my performance (and others in my flight group). Statistics like total flights, total successful landings, munitons spent, munition accuracy, and visualise them all at one glance rather than investigating in each individual tacview. This application serves purpose on doing just that, but with a multi sort / search functionality that I think other wings / DCS players may find valuable, so I published it out here to github.

I need help with this repository as my real life job(s) are quite busy, and rather than keep my code siloed and not open I decided to put it out here to seek help on having other people help on extending functionality and features. DCS is a great community in that we all share this great hobby but also there are some others with some great ideas and skills that will help my project thrive.

So feel free to open a PR with any fixes! I'll be structuring and adding issues in the near future that need to be prioritized.

---

## **Requirements**
[SQL Lite Studio](https://sqlitestudio.pl/) - Great for dealing with the SQL Lite database

[Tacview](https://www.tacview.net/product/about/en/) - You do not need the paid for version, but you need the free or paid version installed, it's a great app and I highly encourage you to purchase this - they are a great group of devs!

[Digital Combat Simulator](https://www.digitalcombatsimulator.com/en/) - You don't necessarily need this installed but the tacview files are generated from DCS while it's running.

---

## **Application Flow (May 3rd, 2023)**

https://miro.com/app/live-embed/uXjVMM1gosk=/?moveToViewport=-1084,-635,2455,2045&embedId=82969163549

---

## **General tasks**
:heavy_check_mark: Build base repository

:heavy_check_mark: Build base SQLite database for data imports and management

:heavy_check_mark: Create container application with separate sections for functionality (flight logs / tracking etc) that can run by itself in windows

:heavy_check_mark: Add quick stats to app launch home page

:heavy_check_mark: Add contribute info to app launch home page

:heavy_check_mark: Run test imports of tacview exports

:heavy_check_mark: Run tacview automatically while importing file

:x: Create discord bot that runs off of app's data (can respond to commands) to generate rendered image reports (use of canvas potentially)

:x: Implement basic currency system based on varying factors (flight time, munitions spent, crashes etc)

:x: Add basic app settings needed by functional areas of application in "Settings" view

:x: Add discord server

---

## **Tooling**
:heavy_check_mark: Build tool for automating tacview file csv exports to `flightlogimports` table and `flightlogs` in database

---

## **User interface for data management (importing and other)**

:heavy_check_mark: (Create framework that utilizes bootstrap or otherwise in a HTML / web interface for interaction)

:heavy_check_mark: (Create interface for database associations for pilot duplication)

:heavy_check_mark: (Create first version of interface for adding additional tacview file data (map location via drop down to start))

---

## **Visualization**

:heavy_check_mark: Create first graphs (munitions) to show spent munitions based on tracked pilot(s)

:x: Show flight time (time in total) based on selections

---

## **Database**

Below is a list of the current tables and columns currently used in the database with a description of it's data. This is so when you're poking around looking at the data you understand some of the types but more importantly how some of the data is formatted as to avoid confusion.

### **Tables and columns**

> TABLE: **events**
>
> **Description:** Master list of all events captured by tacview for tracking and referencing in queries in app.
> **Columns:** id (auto increment) | name | prettyname

> TABLE: **flightlogimports**
>
> **Description:** This table is structured to take all tacview flightlog csv exports directly with the addition of a `flightlog_id` and `id` column for flight log import tracking / references for later retreiving. The flight logs are imported into this table by omitting the first column which has the column headers (named as the ones in this table).
> **Columns:** id (auto increment) | mission_time | primary_object_id | primary_object_name | primary_object_coalition | primary_object_pilot | primary_object_registration | primary_object_squawk | event | occurences | secondary_object_id | secondary_object_name | secondary_object_coalition | secondary_object_pilot | secondary_object_registration | secondary_object_squawk | relevant_object_id | relevant_object_name | relevant_object_coalition | relevant_object_pilot | relevant_object_registration | relevant_object_squawk | flightlog_id | server | location | id

> TABLE: **flightlogs**
>
> **Description:** This table is for tracking the actual flight log file imports with the tool. The `id` column here is referenced to the `flightlog_id` in the `flightlogimports` table for association purposes for later database querying.
> **Columns:** id (auto increment) | tracked_pilots | server | location | filename | import_date | flight_date

> TABLE: **munitions**
>
> **Description:** The idea with this table is to reference this data for a later implementation of total munitions used and spent with cost calculations. Later on, it may be fun to explore a system which incorporates calculating munition expendature per mission, per pilot for future use. Like an amazon.com version for bombs! No idea, just thought this would be fun and could open up some potential future moves with the system in whole. This should ideally be controlled by a UI for the user running this system for their group so they can add munitions and costs per munition.
> **Columns:** id (auto increment) | name | currency_cost

> TABLE: **locations**
>
> **Description:** All current maps / locations available by DCS for tracking and referencing in queries in app.
> **Columns:** id (auto increment) | name | date_added

> TABLE: **multiplayerservers**
>
> **Description:** table for saving user added multiplayer server information.
> **Columns:** id (auto increment) | name | date_added

> TABLE: **pilotdata**
>
> **Description:** This table tracks overall pilot data as it pertains to the system for statistics.
> **Columns:** id (auto increment) | ident1 | ident2 | trackby | last_seen | date_added

## Quick start

This application uses electron. I'm not particularly fond of it, but it suits the purpose of my needs. I've tried other frameworks like Tauri and even Qt but unfortunately after *extensive* tries I could not get an environment stood up in the latter offerings. Nothing to say a migration couldn't happen later on, because it obviously can.

I took the MVP approach in that my idea in this was to get this out as fast as possible with my own least personal amount of effort. Example: Yes I know we can support typescript, I didn't add it but we can in the future and other things like that. i.e. *"How fast can I make this knowing what I know".* So there are many movements for improvements.

Make sure you have [Node.js](https://nodejs.org) installed, then type...
```
git clone git@github.com:webdevbrian/DCS-WAR-ROOM.git
cd DCS-WAR-ROOM
npm install
npm start
```
...and you should have a running desktop application.

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
